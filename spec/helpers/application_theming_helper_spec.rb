# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationThemingHelper, type: :helper do
  describe '#application_resources' do
    subject { helper.application_resources }

    it { is_expected.to be_html_safe }

    it 'has application.js' do
      expect(subject).to have_tag('script', with: {
        :'src^' => '/assets/application-'
      })
    end

    it 'has jquery' do
      expect(subject).to have_tag('script', with: {
        :'src^' => '/assets/jquery-'
      })
    end
  end
end
