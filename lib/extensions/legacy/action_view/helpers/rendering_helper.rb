module Extensions::Legacy::ActionView::Helpers::RenderingHelper
  def self.included(module_)
    module_.alias_method_chain :render, :within_layout
  end

  def render_with_within_layout(*args, &proc)
    arg = args.shift
    case arg
    when Hash
      within_layout = arg.delete(:within_layout)
      return view_renderer.render_within_layout(self, within_layout, *args, &proc) if within_layout
    end

    args.unshift(arg)
    render_without_within_layout(*args, &proc)
  end
end
