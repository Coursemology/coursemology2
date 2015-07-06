require 'rails_helper'

RSpec.describe ApplicationThemingHelper, type: :helper do
  describe '#application_resources' do
    subject { helper.application_resources }

    it { should be_html_safe }

    it 'has application.js' do
      expect(subject).to have_tag('script', with: {
        src: '/assets/application.js'
      })
    end

    it 'has jquery' do
      expect(subject).to have_tag('script', with: {
        src: '/assets/jquery.js'
      })
    end
  end
end
