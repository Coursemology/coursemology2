# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::VideosController do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:course_manager, course: course).user }
    let!(:course) { create(:course) }
    let!(:video) { create(:video, :published, course: course, duration: 100) }

    before { controller_sign_in(controller, user) }

    describe '#index' do
      render_views # the assertions below are about what the jbuilder templates pull from the DB

      subject { get :index, params: { course_id: course }, format: :json }

      let(:json_response) { JSON.parse(response.body) }
      let(:video_json) { json_response['videos'].find { |v| v['id'] == video.id } }

      context 'when the video has a cached statistic' do
        before { video.statistic.update!(watch_freq: [1] * 100, percent_watched: 42, cached: true) }

        it 'renders the percentage watched' do
          subject
          expect(response).to have_http_status(:ok)
          expect(video_json['percentWatched']).to eq(42)
        end
      end

      context 'when the video has no cached statistic yet' do
        it 'renders the default zero percentage' do
          subject
          expect(response).to have_http_status(:ok)
          expect(video_json['percentWatched']).to eq(0)
        end
      end

      context 'when the user cannot analyze videos' do
        let(:user) { create(:course_student, course: course).user }

        it 'omits the analytics fields' do
          subject
          expect(response).to have_http_status(:ok)
          expect(video_json).not_to have_key('percentWatched')
          expect(video_json).not_to have_key('watchCount')
        end
      end
    end
  end
end
