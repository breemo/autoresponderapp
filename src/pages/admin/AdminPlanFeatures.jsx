import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams } from "react-router-dom";

export default function AdminPlanFeatures() {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(planId || "");

  const [planFeatures, setPlanFeatures] = useState([]);
  const [msg, setMsg] = useState("");
const { planId } = useParams();

  useEffect(() => {
  if (planId) setSelectedPlan(planId);
}, [planId]);

  
  useEffect(() => {
    fetchPlans();
    fetchFeatures();
  }, []);

  useEffect(() => {
    if (selectedPlan) fetchPlanFeatures(selectedPlan);
  }, [selectedPlan]);

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("plans").select("*");
    if (!error) setPlans(data || []);
  };

  const fetchFeatures = async () => {
    const { data, error } = await supabase.from("features").select("*");
    if (!error) setFeatures(data || []);
  };

  const fetchPlanFeatures = async (planId) => {
    const { data, error } = await supabase
      .from("plan_features")
      .select("feature_id")
      .eq("plan_id", planId);

    if (!error) {
      setPlanFeatures(data.map((x) => x.feature_id));
    }
  };

  const toggleFeature = async (featureId, enabled) => {
    setMsg("");

    if (enabled) {
      // إضافة
      const { error } = await supabase.from("plan_features").insert([
        { plan_id: selectedPlan, feature_id: featureId },
      ]);

      if (error) setMsg("❌ حدث خطأ أثناء الإضافة");
      else setPlanFeatures((prev) => [...prev, featureId]);
    } else {
      // حذف
      const { error } = await supabase
        .from("plan_features")
        .delete()
        .eq("plan_id", selectedPlan)
        .eq("feature_id", featureId);

      if (error) setMsg("❌ حدث خطأ أثناء الحذف");
      else setPlanFeatures((prev) => prev.filter((id) => id !== featureId));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ربط الميزات مع الباقات</h1>
      <p className="text-gray-500 mb-6">
        اختر باقة ثم فعّل الميزات التي تريدها لهذه الباقة.
      </p>

      {msg && <p className="mb-4 text-blue-600">{msg}</p>}

      {/* اختيار الباقة */}
      <div className="mb-6">
        <label className="block mb-2">اختر الباقة:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
        >
          <option value="">-- اختر الباقة --</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* عرض المميزات */}
      {selectedPlan && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-4">المميزات المتاحة</h2>

          {features.map((f) => {
            const isEnabled = planFeatures.includes(f.id);
            return (
              <div
                key={f.id}
                className="flex justify-between items-center border-b py-3"
              >
                <div>
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-gray-500 text-sm">{f.slug}</div>
                </div>

                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => toggleFeature(f.id, e.target.checked)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
