# frozen_string_literal: true
module RenderWithinLayoutHelper
  def render(*args, &proc)
    arg = args.shift
    case arg
    when Hash
      within_layout = arg.delete(:within_layout)
      return view_renderer.render_within_layout(self, within_layout, *args, &proc) if within_layout
    end

    args.unshift(arg)
    super
  end
end
