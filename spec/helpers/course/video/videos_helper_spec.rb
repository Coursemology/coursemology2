# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::VideosHelper, type: :helper do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#video_tabs' do
      let(:course) { create(:course) }
      before do
        helper.instance_variable_set(:@course, course)
        helper.define_singleton_method(:current_course) {}
        allow(helper).to receive(:current_course).and_return(course)
      end

      subject { helper.display_video_tabs }
      context 'when there is exactly 1 tab' do
        it 'returns an empty list' do
          expect(subject).to be_nil
        end
      end

      context 'when there are more than 1 tab' do
        let!(:tabs) { create(:course_video_tab, course: course) }
        it 'returns a list of tabs' do
          expect(subject).to have_tag('ul.nav.nav-tabs') do
            with_tag('li') do
              with_tag('a')
            end
          end
        end
      end
    end
  end
end
