import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";



export default function ClientIntegrations() {
  const { user } = useAuth();
  const clientId = user?.client_id || user?.id;
  const [features, setFeatures] = useState([]);
  const [clientIntegrations, setClientIntegrations] = useState([]);

  const clientId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    loadFeatures();
    loadIntegrations();
  }, []);

  async function loadFeatures() {
    // جلب ميزات الباقة
    const { data: plan } = await supabase
      .from("clients")
      .select("plan_id")
      .eq("id", clientId)

    setClientIntegrations(data || []);


    const { data } = await supabase
      .from("plan_features")
      .select("features(id,name,slug,fields)")
      .eq("plan_id", plan.plan_id);

    setFeatures(data.map((x) => x.features));
  }

  async function loadIntegrations() {
    const { data } = await supabase
      .from("client_feature_integrations")
      .select("*")
      .eq("client_id", clientId);

    setClientIntegrations(data || []);
  }

  async function createIntegration(feature) {
    await supabase.from("client_feature_integrations").insert({
      client_id: clientId,
      feature_id: feature.id,
      name: feature.name,
      values: {}
    });

    loadIntegrations();
  }

  function hasIntegration(featureId) {
    return clientIntegrations.some((x) => x.feature_id === featureId);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات التكامل (Integrations)</h1>

      {/* الميزات المتاحة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <div
            key={f.id}
            className="p-4 bg-white shadow rounded border flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold">{f.name}</h2>
              <p className="text-sm text-gray-500">{f.slug}</p>
            </div>

            {!hasIntegration(f.id) ? (
              <button
                onClick={() => createIntegration(f)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                تفعيل
              </button>
            ) : (
              <span className="text-green-600 font-semibold">مفعّل ✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
