import { Card, CardContent } from "@/components/ui/card";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface MonthlyUsageChartProps {
  data: Array<{
    month: string;
    documents: number;
    cost?: number;
  }>;
  title?: string;
  height?: number;
  minHeight?: number;
}

export default function MonthlyUsageChart({
  data,
  title = "Monthly usage",
  height = 300,
  minHeight = 400
}: MonthlyUsageChartProps) {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
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
      categories: data.map(item => item.month),
      title: {
        text: 'Month'
      },
      gridLineWidth: 1,
      gridLineColor: '#E5E7EB',
      lineColor: '#D1D5DB',
      tickColor: '#D1D5DB'
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Active Users'
      },
      gridLineColor: '#E5E7EB',
      lineColor: '#D1D5DB',
      tickInterval: 200
    },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#D1D5DB',
      borderRadius: 8,
      shadow: true
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false
        },
        borderRadius: 0,
        borderWidth: 0
      }
    },
    series: [
      {
        name: 'Segment 1',
        type: 'column',
        data: data.map(item => Math.round(item.documents * 0.6)), // Dark blue segment (60%) - bottom
        color: '#1E40AF' // Dark blue - bottom
      },
      {
        name: 'Segment 2',
        type: 'column',
        data: data.map(item => Math.round(item.documents * 0.4)), // Light blue segment (40%) - top
        color: '#93C5FD' // Light blue - top
      }
    ],
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

