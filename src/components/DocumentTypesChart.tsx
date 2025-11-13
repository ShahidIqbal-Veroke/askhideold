import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface DocumentType {
  name: string;
  value: number;
  color: string;
}

interface DocumentTypesChartProps {
  data: DocumentType[];
  title?: string;
  height?: number;
  minHeight?: number;
}

export default function DocumentTypesChart({
  data,
  title = "Types of documents analyzed",
  height = 300,
  minHeight = 400
}: DocumentTypesChartProps) {
  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: height,
      backgroundColor: 'transparent',
      // spacing: [20, 20, 20, 20],
      reflow: false // Prevent chart from resizing
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
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: false,
        cursor: 'default',
        innerSize: '60%', // Makes it a donut chart
        dataLabels: {
          enabled: false
        },
        showInLegend: true,
        center: ['40%', '50%'], // Position chart to the left to make room for legend
        size: '80%'
      }
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      x: -50,
      itemStyle: {
        fontSize: '14px',
        color: '#374151'
      },
      itemMarginBottom: 8,
      labelFormatter: function() {
        const point = this as any;
        return `<span style="color: ${point.color}; font-size: 12px;">●</span> ${point.name}: ${point.y}%`;
      }
    },
    series: [{
      name: 'Documents',
      type: 'pie',
      data: data.map(item => ({
        name: item.name,
        y: item.value,
        color: item.color
      }))
    }],
    credits: {
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

