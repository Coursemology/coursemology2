# frozen_string_literal: true

# Patch for rails vulnerability CVE-2019-5418 and CVE-2019-5419
# TODO: Remove this file after upgrading to rails 6
ActionDispatch::Request.prepend(Module.new do
  def formats
    super().select do |format|
      format.symbol || format.ref == '*/*'
    end
  end
end)
