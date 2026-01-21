import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Settings coming soon</p>
        </div>
      </div>
    </div>
  );
}
