# frozen_string_literal: true
module Extensions::RenderWithinLayout::ActionView::Renderer
  def render_within_layout(context, layout, *_)
    context.view_flow.set(:layout, context.capture { yield })
    context.render template: "layouts/#{layout}"
  end
end
