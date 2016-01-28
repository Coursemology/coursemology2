# frozen_string_literal: true
require 'rails_helper'

RSpec.describe RouteOverridesHelper, type: :helper do
  let(:helper_host) do
    RouteOverridesHelper.send(:map_route, :some_long_helper, to: :some_short_helper)
    Class.new do
      include RouteOverridesHelper
      def some_short_helper_path(*); end
    end
  end
  subject { helper_host.new }

  describe '.map_route' do
    it 'generates overrides for both _path and _url suffixes' do
      expect(subject).to respond_to(:some_long_helper_path)
      expect(subject).to respond_to(:some_long_helper_url)
    end

    it 'generates both singular and plural routes' do
      expect(subject).to respond_to(:some_long_helper_path)
      expect(subject).to respond_to(:some_long_helpers_path)
    end

    it 'generates routes for new and edit actions' do
      expect(subject).to respond_to(:new_some_long_helper_path)
      expect(subject).to respond_to(:edit_some_long_helper_path)
    end

    it 'forwards all arguments to the correct helper method' do
      expect(subject).to receive(:some_short_helper_path).with(1, 'a')
      subject.some_long_helper_path(1, 'a')
    end
  end
end
