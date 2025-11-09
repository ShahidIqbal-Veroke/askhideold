import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';

interface SankeyNode {
  id: string;
  title: string;
  value: number;
  color: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface D3SankeyChartProps {
  data: SankeyData;
  title: string;
  className?: string;
  width?: number;
  height?: number;
}

const D3SankeyChart: React.FC<D3SankeyChartProps> = ({ 
  data, 
  title, 
  className = "", 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [innerWidth, innerHeight]]);

    // Prepare data for D3 sankey
    const graph = {
      nodes: data.nodes.map(d => ({ ...d, name: d.title })),
      links: data.links.map(d => ({
        source: data.nodes.findIndex(n => n.id === d.source),
        target: data.nodes.findIndex(n => n.id === d.target),
        value: d.value
      }))
    };

    // Generate the sankey layout
    const { nodes, links } = sankeyGenerator(graph);

    // Create color scale
    const colorScale = scaleOrdinal<string>()
      .domain(data.nodes.map(d => d.id))
      .range(data.nodes.map(d => d.color));

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add links
    g.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => colorScale(data.nodes[d.source.index].id))
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .style("mix-blend-mode", "multiply");

    // Add nodes
    const node = g.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("g");

    node.append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => colorScale(data.nodes[d.index].id))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("rx", 3)
      .attr("ry", 3);

    // Add node labels
    node.append("text")
      .attr("x", (d: any) => d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .text((d: any) => d.name);

    // Add value labels on nodes
    node.append("text")
      .attr("x", (d: any) => d.x0 < innerWidth / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2 + 15)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("fill", "#6b7280")
      .text((d: any) => d.value.toLocaleString());

  }, [data, width, height]);

  return (
    <Card className={`border-0 bg-white/30 backdrop-blur-xl shadow-xl rounded-2xl border border-white/20 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <span>{title}</span>
          </CardTitle>
          <Badge className="bg-white/40 backdrop-blur-sm text-indigo-700 font-medium rounded-full border border-white/30">Flux</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="w-full h-auto"
            style={{ minWidth: `${width}px` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default D3SankeyChart;