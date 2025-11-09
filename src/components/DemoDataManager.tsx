import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DemoInitializer } from "@/lib/demoInitializer";
import { db } from "@/lib/localStorage";
import { RefreshCw, Download, Upload, Trash2, Plus, Database, Activity } from "lucide-react";

export function DemoDataManager() {
  const [stats, setStats] = useState(DemoInitializer.getStats());
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = () => {
    setStats(DemoInitializer.getStats());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleForceInit = async () => {
    setIsLoading(true);
    try {
      DemoInitializer.forceInit();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      DemoInitializer.reset();
      refreshStats();
    }
  };

  const handleAddTestScenarios = () => {
    DemoInitializer.addTestScenarios();
    refreshStats();
  };

  const handleExport = () => {
    DemoInitializer.exportData();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = e.target?.result as string;
            DemoInitializer.importData(jsonData);
            refreshStats();
          } catch (error) {
            alert('Error importing data: ' + error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Demo Database Manager
          </CardTitle>
          <CardDescription>
            Manage demo data for development and testing. This panel is only visible in development mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Statistics */}
          <div>
            <h3 className="text-sm font-medium mb-3">Database Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats).map(([key, value]) => {
                if (key === 'total_size') return null;
                return (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    <div className="text-sm text-slate-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline">
                Storage Size: {stats.total_size}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <Separator />

          {/* Data Management Actions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleForceInit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Reinitialize Data
              </Button>
              
              <Button
                onClick={handleAddTestScenarios}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Test Scenarios
              </Button>
              
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-red-600">Danger Zone</h3>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset All Data
            </Button>
          </div>

          <Separator />

          {/* Workflow Chain Viewer */}
          <div>
            <h3 className="text-sm font-medium mb-3">Sample Workflow Chain</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">Évènement</Badge>
                <span>→</span>
                <Badge variant="secondary">Cycle de vie</Badge>
                <span>→</span>
                <Badge variant="secondary">Historique</Badge>
                <span>→</span>
                <Badge variant="default">Alerte</Badge>
                <span>→</span>
                <Badge variant="default">Dossier</Badge>
              </div>
              <div className="mt-3 text-xs text-slate-600">
                This represents the core workflow implemented in the demo data.
              </div>
            </div>
          </div>

          {/* Real-time Simulation */}
          <div>
            <h3 className="text-sm font-medium mb-3">Development Features</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Validate Workflow Integrity</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const result = DemoInitializer.validateWorkflowIntegrity();
                    alert(`Integrity Check:\n- Events: ${result.events}\n- Alerts: ${result.alerts}\n- Valid pairs: ${result.valid_event_alert_pairs}\n- Orphaned: ${result.orphaned_alerts}`);
                    refreshStats();
                  }}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Check Integrity
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Validates Event → Alert relationships and fixes orphaned data.
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Updates</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => DemoInitializer.simulateRealTimeUpdates()}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Start Simulation
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Simulates alert status changes every 30 seconds for demo purposes.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}