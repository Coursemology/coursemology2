# frozen_string_literal: true
module Extensions::RenderWithinLayout::ActionView::Renderer
  def render_within_layout(context, layout, *_, &block)
    context.view_flow.set(:layout, context.capture(&block))
    context.render template: "layouts/#{layout}"
  end
end
