import { Card, CardContent } from "@/components/ui/card";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface WeeklyActivityChartProps {
  data: Array<{
    day: string;
    analyses: number;
  }>;
  title?: string;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
  minHeight?: number;
}

export default function WeeklyActivityChart({
  data,
  title = "Activité de la semaine",
  height = 300,
  lineColor = "#06B6D4",
  strokeWidth = 2,
  minHeight = 400
}: WeeklyActivityChartProps) {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      height: height,
      backgroundColor: 'transparent',
      reflow: false
    },
    title: {
      text: title,
      align: 'left',
      x: 0,
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1F2937'
      }
    },
    xAxis: {
      categories: data.map(item => item.day),
      gridLineWidth: 1,
      gridLineColor: '#E5E7EB',
      lineColor: '#D1D5DB',
      tickColor: '#D1D5DB'
    },
    yAxis: {
      title: {
        text: null
      },
      gridLineColor: '#E5E7EB',
      lineColor: '#D1D5DB'
    },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#D1D5DB',
      borderRadius: 8,
      shadow: true
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 4,
          fillColor: lineColor,
          lineColor: '#FFFFFF',
          lineWidth: 2
        },
        lineWidth: strokeWidth,
        color: lineColor
      }
    },
    series: [{
      name: 'Analyses',
      type: 'line',
      data: data.map(item => item.analyses),
      color: lineColor
    }],
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    }
  };

  return (
    <Card style={{ minHeight: `${minHeight}px` }}>
      <CardContent className="p-6">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </CardContent>
    </Card>
  );
}

