import { Plugin } from 'chart.js';

const emptyChartPlugin: Plugin = {
  id: 'empty-chart',
  afterDraw(chart) {
    if (
      chart.data.datasets.length === 0 ||
      chart.data.datasets.every((d) => d.data.length === 0)
    ) {
      // No data is present
      const { ctx, width, height } = chart;
      const scales = chart.options?.scales;

      if (scales) {
        Object.entries(scales).forEach(([_, value]) => {
          if (value?.grid?.display) {
            value.grid.display = false;
          }
        });
      }
      chart.update();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
      const titleText = chart.options?.plugins?.title?.text;
      // For now, we will only handle single-line titles.
      // TODO: Support multi-line titles, which will be in an array form.
      if (typeof titleText === 'string') {
        // Aligns text 18 pixels from top, just like Chart.js
        ctx.fillText(titleText, width / 2, 18);
      }
      ctx.fillText('No data to display', width / 2, height / 2);
      ctx.restore();
    }
  },
};

export default emptyChartPlugin;
