import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ArrowRight } from "lucide-react";

interface FlowNode {
  id: string;
  title: string;
  value: number;
  color: string;
  percentage?: number;
}

interface FlowData {
  nodes: FlowNode[];
  connections: { from: string; to: string; value: number }[];
}

interface SankeyFlowChartProps {
  data: FlowData;
  title: string;
  className?: string;
}

export const SankeyFlowChart: React.FC<SankeyFlowChartProps> = ({ data, title, className = "" }) => {
  const maxValue = Math.max(...data.nodes.map(node => node.value));
  
  return (
    <Card className={`border-0 shadow-lg bg-white/70 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <span>{title}</span>
          </CardTitle>
          <Badge className="bg-indigo-100 text-indigo-700 font-semibold">Flux</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.nodes.map((node, index) => {
            const width = (node.value / maxValue) * 100;
            const nextNode = data.nodes[index + 1];
            const connection = data.connections.find(conn => conn.from === node.id);
            
            return (
              <div key={node.id} className="space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="w-36 text-right">
                    <span className="text-sm font-semibold text-slate-700">{node.title}</span>
                  </div>
                  <div className="flex-1 relative group">
                    <div 
                      className="h-10 rounded-lg shadow-sm flex items-center justify-center text-white font-bold text-sm transition-all duration-500 hover:shadow-lg hover:scale-105 cursor-pointer"
                      style={{ 
                        width: `${Math.max(width, 15)}%`, 
                        backgroundColor: node.color,
                        background: `linear-gradient(135deg, ${node.color}, ${node.color}dd)`
                      }}
                    >
                      <span className="drop-shadow-sm">{node.value.toLocaleString()}</span>
                    </div>
                    {node.percentage && (
                      <div className="absolute -top-6 left-2 text-xs font-semibold text-slate-600">
                        {node.percentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className="w-16 text-left">
                    <span className="text-xs text-slate-500 font-medium">
                      {((node.value / maxValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {nextNode && connection && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <div className="w-px h-4 bg-slate-300"></div>
                      <ArrowRight className="w-3 h-3" />
                      <div className="w-px h-4 bg-slate-300"></div>
                      <span className="text-xs font-medium">
                        {connection.value > 0 ? `${connection.value} transf\u00e9r\u00e9s` : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Flow Summary */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {((data.nodes.find(n => n.id.includes('approuves'))?.value || 0) / maxValue * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600 font-medium">Taux d'approbation</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {((data.nodes.find(n => n.id.includes('suspects'))?.value || 0) / maxValue * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600 font-medium">Taux de suspicion</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {((data.nodes.find(n => n.id.includes('frauduleux'))?.value || 0) / maxValue * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600 font-medium">Taux de fraude</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};