import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";


export function BreakageAlertsSection({ alerts }: { alerts: any[] }) {
  return (
    <section className="bg-white p-4 rounded-lg  border-container-card">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="font-inter font-semibold text-sm">Breakage Alerts</h3>
        <Badge variant="secondary">{alerts.length}</Badge>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, index) => (
          <div key={index} className={`p-3 rounded-lg border ${alert.type === 'critical' ? 'bg-red-50 border-red-200' :
            alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
              'bg-blue-50 border-blue-200'
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-semibold  text-sm font-inter ${alert.type === 'critical' ? 'text-primary' :
                  alert.type === 'warning' ? 'text-orange-800' :
                    'text-blue-800'
                  }`}>{alert.title}</h4>
                <p className={`text-xs mt-1 font-inter ${alert.type === 'critical' ? 'text-primary' :
                  alert.type === 'warning' ? 'text-orange-700' :
                    'text-blue-700'
                  }`}>{alert.message}</p>
              </div>
              <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                {alert.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
