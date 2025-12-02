import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminClientSettings() {
  const { id: clientId } = useParams();
  const { user } = useAuth(); // admin or client

  const [client, setClient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [features, setFeatures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [settingsRowId, setSettingsRowId] = useState(null);
  const [featureValues, setFeatureValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    fetchClientAndFeatures();
  }, [clientId]);

  async function fetchClientAndFeatures() {
    setLoading(true);
    setMsg("");

    try {
      // 1) بيانات العميل
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, business_name, email, plan_id")
        .eq("id", clientId)
        .single();

      if (clientError || !clientData) {
        console.error(clientError);
        setMsg("❌ لم يتم العثور على هذا العميل");
        setLoading(false);
        return;
      }

      setClient(clientData);

      // 2) بيانات الخطة
      let planData = null;
      if (clientData.plan_id) {
        const { data, error } = await supabase
          .from("plans")
          .select("id, name, allow_self_edit")
          .eq("id", clientData.plan_id)
          .maybeSingle();

        if (error) {
          console.error(error);
        } else {
          planData = data || null;
        }
      }
      setPlan(planData);

      // 3) الميزات المفعّلة لهذه الخطة عبر plan_features
      if (!clientData.plan_id) {
        setFeatures([]);
        setLoading(false);
        return;
      }

      const { data: pfData, error: pfError } = await supabase
        .from("plan_features")
        .select("feature_id")
        .eq("plan_id", clientData.plan_id);

      if (pfError) {
        console.error(pfError);
        setMsg("⚠️ تعذر جلب ميزات الخطة");
        setFeatures([]);
        setLoading(false);
        return;
      }

      const featureIds = (pfData || []).map((x) => x.feature_id);
      if (featureIds.length === 0) {
        setFeatures([]);
        setLoading(false);
        return;
      }

      const { data: featuresData, error: featuresError } = await supabase
        .from("features")
        .select("id, name, slug, description, fields")
        .in("id", featureIds);

      if (featuresError) {
        console.error(featuresError);
        setMsg("⚠️ تعذر جلب قائمة الميزات");
        setFeatures([]);
      } else {
        setFeatures(featuresData || []);
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ حدث خطأ غير متوقع أثناء جلب البيانات");
    }

    setLoading(false);
  }

  // فتح الـ Drawer لميزة معيّنة
  async function openFeatureDrawer(feature) {
    setMsg("");
    setActiveFeature(feature);
    setDrawerOpen(true);
    setSaving(false);
    setSettingsRowId(null);

    // تحديد إذا الفورم قابل للتعديل أم لا
    const isAdmin = user?.role === "admin";
    const clientCanEdit = plan?.allow_self_edit === true;
    setReadOnly(!isAdmin && !clientCanEdit);

    // نقرأ إعدادات العميل لهذه الميزة من client_settings
    const { data, error } = await supabase
      .from("client_settings")
      .select("id, settings")
      .eq("client_id", clientId)
      .eq("feature_id", feature.id)
      .maybeSingle();

    if (error) {
      console.error(error);
    }

    if (data) {
      setSettingsRowId(data.id);
    }

    // تجهيز قيم الحقول حسب fields في جدول features
    const fieldsDef =
      feature.fields && typeof feature.fields === "object" && !Array.isArray(feature.fields)
        ? feature.fields
        : {};

    const existingSettings = (data && data.settings) || {};

    const initialValues = {};
    Object.entries(fieldsDef).forEach(([fieldName]) => {
      initialValues[fieldName] = existingSettings[fieldName] ?? "";
    });

    setFeatureValues(initialValues);
  }

  function closeFeatureDrawer() {
    setDrawerOpen(false);
    setActiveFeature(null);
    setFeatureValues({});
    setSettingsRowId(null);
    setSaving(false);
  }

  function handleFieldChange(fieldName, value) {
    setFeatureValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }

  async function handleSaveFeature(e) {
    e.preventDefault();
    if (readOnly) return;
    if (!activeFeature) return;

    setSaving(true);
    setMsg("");

    try {
      const payload = {
        client_id: clientId,
        feature_id: activeFeature.id,
        settings: featureValues,
      };

      if (settingsRowId) {
        const { error } = await supabase
          .from("client_settings")
          .update({ settings: featureValues })
          .eq("id", settingsRowId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("client_settings")
          .insert([payload])
          .select("id")
          .single();

        if (error) throw error;
        setSettingsRowId(data.id);
      }

      setMsg("✅ تم حفظ إعدادات الميزة بنجاح");
    } catch (err) {
        console.error("Save Error:", err);
        setMsg("❌ خطأ أثناء حفظ الإعدادات: " + (err?.message || "UNKNOWN ERROR"));
    }

    setSaving(false);
  }

  const isAdmin = user?.role === "admin";
  const clientCanEdit = plan?.allow_self_edit === true;

  return (
    <div>
      {loading ? (
        <p>جارِ تحميل بيانات العميل...</p>
      ) : !client ? (
        <p className="text-red-500">{msg || "لم يتم العثور على العميل"}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2">
            إعدادات العميل: {client.business_name}
          </h1>
          <p className="text-gray-500 mb-1">{client.email}</p>
          {plan && (
            <p className="text-gray-500 mb-4">الخطة الحالية: {plan.name}</p>
          )}

          {msg && (
            <p className="mb-4 text-blue-700 font-semibold">
              {msg}
            </p>
          )}

          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-3">
              الميزات المفعّلة لهذا العميل
            </h2>

            {features.length === 0 ? (
              <p className="text-gray-400 text-sm">
                لا توجد ميزات مفعّلة ضمن خطة هذا العميل.
              </p>
            ) : (
              <div className="divide-y">
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="font-semibold">{f.name}</div>
                      {f.description && (
                        <div className="text-gray-500 text-sm">
                          {f.description}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openFeatureDrawer(f)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                    >
                      تعديل الإعدادات
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isAdmin && !clientCanEdit && (
              <p className="mt-4 text-xs text-gray-500">
                ⚠️ لا تتيح خطتك الحالية تعديل الإعدادات بنفسك. الرجاء التواصل مع
                المسؤول.
              </p>
            )}
          </div>
        </>
      )}

      {/* Drawer من اليسار */}
      {drawerOpen && activeFeature && (
        <div className="fixed inset-0 z-50 flex">
          {/* اللوح (Drawer) على اليسار */}
          <div className="w-full max-w-md h-full bg-white shadow-xl border-r p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">
              إعدادات: {activeFeature.name}
            </h2>
            {activeFeature.slug && (
              <p className="text-gray-500 text-sm mb-4">
                {activeFeature.slug}
              </p>
            )}

            <form onSubmit={handleSaveFeature} className="space-y-4">
              {activeFeature.fields &&
              typeof activeFeature.fields === "object" &&
              !Array.isArray(activeFeature.fields) ? (
                Object.entries(activeFeature.fields).map(
                  ([fieldName, fieldType]) => {
                    const type =
                      fieldType === "password" ||
                      fieldType === "number" ||
                      fieldType === "url"
                        ? fieldType
                        : "text";

                    return (
                      <div key={fieldName}>
                        <label className="block text-sm mb-1">
                          {fieldName}
                        </label>
                        <input
                          type={type}
                          value={featureValues[fieldName] || ""}
                          onChange={(e) =>
                            handleFieldChange(fieldName, e.target.value)
                          }
                          className="border rounded px-3 py-2 w-full"
                          disabled={readOnly}
                        />
                      </div>
                    );
                  }
                )
              ) : (
                <p className="text-sm text-gray-500">
                  لا توجد حقول معرفة لهذه الميزة.
                </p>
              )}

              <div className="flex gap-2 mt-6">
                {!readOnly && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeFeatureDrawer}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  إغلاق
                </button>
              </div>

              {readOnly && (
                <p className="mt-3 text-xs text-gray-500">
                  هذه الإعدادات للعرض فقط حسب صلاحيات خطتك.
                </p>
              )}
            </form>
          </div>

          {/* الـ Overlay على بقية الصفحة (يمين) */}
          <div
            className="flex-1 h-full bg-black/40"
            onClick={closeFeatureDrawer}
          />
        </div>
      )}
    </div>
  );
}
