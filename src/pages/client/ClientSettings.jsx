import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../App";

export default function ClientSettings() {
  const { user } = useAuth();
  const clientId = user?.id;

  const [loading, setLoading] = useState(true);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [activeIntegrations, setActiveIntegrations] = useState([]);

  // ---------------------
  // 1) Load data
  // ---------------------
  useEffect(() => {
    if (!clientId) return;

    async function loadData() {
      setLoading(true);

      // 1) Get plan_id of client
      const { data: client } = await supabase
        .from("clients")
        .select("plan_id")
        .eq("id", clientId)
        .single();

      const planId = client?.plan_id;

      // 2) Get features inside the plan
      const { data: planFeatures } = await supabase
        .from("plan_features")
        .select("feature_id, features(*)")
        .eq("plan_id", planId);

      const featuresList = planFeatures?.map((pf) => pf.features) || [];

      // 3) Get active integrations of client
      const { data: integrations } = await supabase
        .from("client_feature_integrations")
        .select("*")
        .eq("client_id", clientId);

      // split: active + inactive
      const active = integrations;
      const activeFeatureIds = active.map((i) => i.feature_id);

      const available = featuresList.filter(
        (f) => !activeFeatureIds.includes(f.id)
      );

      setAvailableFeatures(available);
      setActiveIntegrations(active);
      setLoading(false);
    }

    loadData();
  }, [clientId]);

  // ---------------------
  // 2) Save Integration
  // ---------------------
  async function handleSave(integrationId, values) {
    await supabase
      .from("client_feature_integrations")
      .update({ values })
      .eq("id", integrationId);

    alert("تم حفظ الإعدادات بنجاح");
  }

  // ---------------------
  // 3) Add Integration
  // ---------------------
  async function handleAddFeature(feature) {
    await supabase.from("client_feature_integrations").insert([
      {
        client_id: clientId,
        feature_id: feature.id,
        name: feature.name,
        is_active: true,
        values: {},
      },
    ]);

    window.location.reload();
  }

  // ---------------------
  // 4) Delete Integration
  // ---------------------
  async function handleDelete(integrationId) {
    await supabase
      .from("client_feature_integrations")
      .delete()
      .eq("id", integrationId);

    window.location.reload();
  }

  if (loading)
    return <div className="p-6 text-gray-500">جارِ تحميل الإعدادات...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">إعدادات التكاملات</h1>

      {/* ---------------- ACTIVE ---------------- */}
      <h2 className="text-lg font-semibold mb-3">التكاملات المفعلة</h2>

      {activeIntegrations.length === 0 && (
        <p className="text-gray-500 mb-6">لا يوجد تكاملات مفعلة حالياً.</p>
      )}

      {activeIntegrations.map((integration) => {
        const feature = availableFeatures
          .concat(activeIntegrations.map((i) => i.feature))
          .find((f) => f?.id === integration.feature_id);

        const fields = feature?.fields || [];

        return (
          <div
            key={integration.id}
            className="bg-white border rounded-lg p-5 mb-5 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-3">{integration.name}</h3>

            {/* dynamic fields */}
            {fields.map((field) => (
              <div className="mb-3" key={field.key}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  defaultValue={integration.values?.[field.key] || ""}
                  onChange={(e) => {
                    integration.values[field.key] = e.target.value;
                  }}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleSave(integration.id, integration.values)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                حفظ
              </button>

              <button
                onClick={() => handleDelete(integration.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                حذف
              </button>
            </div>
          </div>
        );
      })}

      {/* ---------------- AVAILABLE ---------------- */}
      <h2 className="text-lg font-semibold mt-10 mb-3">
        تكاملات متاحة حسب خطتك
      </h2>

      {availableFeatures.length === 0 && (
        <p className="text-gray-500">
          لا يوجد تكاملات إضافية في خطتك حالياً.
        </p>
      )}

      {availableFeatures.map((f) => (
        <div
          key={f.id}
          className="bg-gray-100 p-4 border rounded flex justify-between items-center mb-3"
        >
          <div>
            <h3 className="font-semibold">{f.name}</h3>
          </div>

          <button
            onClick={() => handleAddFeature(f)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            تفعيل التكامل
          </button>
        </div>
      ))}
    </div>
  );
}
