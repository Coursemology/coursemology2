export default {
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
        // eslint-disable-next-line no-unused-vars
        Object.entries(scales).forEach(([_, value]) => {
          if (value.grid?.display) {
            // eslint-disable-next-line no-param-reassign
            value.grid.display = false;
          }
        });
      }
      chart.update();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px "Helvetica Neue", Helvetica, Arial, sans-serif';
      // Aligns text 18 pixels from top, just like Chart.js
      ctx.fillText(chart.options?.title?.text ?? '', width / 2, 18);
      ctx.fillText('No data to display', width / 2, height / 2);
      ctx.restore();
    }
  },
};
