
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

const auditData = [
  {
    id: "1",
    date: "13/07/2025",
    time: "14:45",
    document: "facture_garage_martin.pdf",
    sinisterNumber: "SIN-2024-8847",
    user: "V. Dubois",
    action: "fraude",
    comment: "Amount altered, font modified",
    actionType: "manual"
  },
  {
    id: "2", 
    date: "13/07/2025",
    time: "13:22",
    document: "devis_renovation.pdf",
    sinisterNumber: "SIN-2024-8791",
    user: "M. Bernard",
    action: "faux-positif",
    comment: "Poor quality scanned PDF",
    actionType: "manual"
  },
  {
    id: "3",
    date: "13/07/2025", 
    time: "11:15",
    document: "photo_degats.jpg",
    sinisterNumber: "SIN-2024-8832",
    user: "S. Laurent", 
    action: "valide",
    comment: "-",
    actionType: "manual"
  },
  {
    id: "4",
    date: "12/07/2025",
    time: "16:30", 
    document: "certificat_medical.pdf",
    sinisterNumber: "SIN-2024-8801",
    user: "V. Dubois",
    action: "fraude",
    comment: "AI-generated document",
    actionType: "manual"
  },
  {
    id: "5",
    date: "12/07/2025",
    time: "15:12",
    document: "rapport_expertise.pdf", 
    sinisterNumber: "SIN-2024-8770",
    user: "System",
    action: "valide",
    comment: "Automatic analysis - Score: 8%",
    actionType: "auto"
  },
  {
    id: "6",
    date: "12/07/2025",
    time: "14:08",
    document: "facture_plomberie.pdf",
    sinisterNumber: "SIN-2024-8755", 
    user: "A. Martin",
    action: "a-verifier",
    comment: "Expert verification requested",
    actionType: "manual"  
  },
  {
    id: "7",
    date: "11/07/2025",
    time: "17:45",
    document: "photo_vehicule_endomage.jpg",
    sinisterNumber: "SIN-2024-8742",
    user: "C. Rousseau",
    action: "faux-positif", 
    comment: "Unfavorable lighting during capture",
    actionType: "manual"
  },
  {
    id: "8",
    date: "11/07/2025", 
    time: "16:20",
    document: "bon_commande.pdf",
    sinisterNumber: "SIN-2024-8728",
    user: "System",
    action: "fraude",
    comment: "Automatic analysis - Score: 91%", 
    actionType: "auto"
  }
];

const getActionConfig = (action: string) => {
  switch (action) {
    case "valide":
      return {
        icon: CheckCircle,
        label: "Validated",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200"
      };
    case "fraude":
      return {
        icon: XCircle,
        label: "Fraud Confirmed",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200"
      };
    case "faux-positif":
      return {
        icon: RefreshCw,
        label: "False Positive",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200"
      };
    case "a-verifier":
      return {
        icon: AlertTriangle,
        label: "To Verify",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200"
      };
    default:
      return {
        icon: AlertTriangle,
        label: action,
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200"
      };
  }
};

const AuditTrail = () => {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredData = auditData.filter(item => {
    const matchesUser = userFilter === "all" || item.user === userFilter;
    const matchesAction = actionFilter === "all" || item.action === actionFilter;
    // For date filtering in real app, you'd parse and compare dates
    return matchesUser && matchesAction;
  });

  const users = [...new Set(auditData.map(item => item.user))];
  const actions = [...new Set(auditData.map(item => item.action))];

  const exportAudit = () => {
    // In real app, this would generate and download a CSV/Excel file
    console.log("Exporting audit trail...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-slate-600 mt-1">Complete decision traceability</p>
        </div>
        <Button onClick={exportAudit} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>
                      {getActionConfig(action).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> 
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700">Date/Time</th>
                  <th className="text-left p-4 font-medium text-slate-700">Document</th>
                  <th className="text-left p-4 font-medium text-slate-700">Claim No.</th>
                  <th className="text-left p-4 font-medium text-slate-700">User</th>
                  <th className="text-left p-4 font-medium text-slate-700">Action</th>
                  <th className="text-left p-4 font-medium text-slate-700">Comment</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const actionConfig = getActionConfig(item.action);
                  const ActionIcon = actionConfig.icon;
                  
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-slate-900">{item.date}</p>
                          <p className="text-sm text-slate-500">{item.time}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-900 max-w-48 truncate" title={item.document}>
                          {item.document}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-slate-700">
                          {item.sinisterNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">{item.user}</span>
                          {item.actionType === "auto" && (
                            <Badge variant="outline" className="text-xs">
                              Auto
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${actionConfig.bg} ${actionConfig.border} border`}>
                          <ActionIcon className={`w-4 h-4 ${actionConfig.color}`} />
                          <span className={`text-sm font-medium ${actionConfig.color}`}>
                            {actionConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-700 max-w-64 block truncate" title={item.comment}>
                          {item.comment}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {auditData.filter(item => item.action === "valide").length}
                </p>
                <p className="text-sm text-slate-600">Validated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {auditData.filter(item => item.action === "fraude").length}
                </p>
                <p className="text-sm text-slate-600">Frauds</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {auditData.filter(item => item.action === "faux-positif").length}
                </p>
                <p className="text-sm text-slate-600">False Positives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {auditData.filter(item => item.action === "a-verifier").length}
                </p>
                <p className="text-sm text-slate-600">To Verify</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrail;
