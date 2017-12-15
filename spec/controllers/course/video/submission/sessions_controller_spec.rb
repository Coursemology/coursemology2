# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission::SessionsController, type: :controller do
  let!(:instance) { create(:instance, :with_video_component_enabled) }

  with_tenant(:instance) do
    let!(:course) { create(:course, :with_video_component_enabled) }
    let(:student) { create(:course_student, course: course) }
    let(:video) { create(:video, :published, course: course) }
    let!(:session) do
      create(:video_session, :with_events, course: course, video: video, student: student,
                                           session_start: Time.zone.now - 5.seconds,
                                           session_end: Time.zone.now - 5.seconds)
    end

    before { sign_in(student.user) }

    describe 'PUT/PATCH #update' do
      subject do
        patch :update, as: :json, params: {
          course_id: course.id, video_id: video.id, id: session.id,
          session: { events: events }
        }
      end

      context 'when no events are provided' do
        let(:events) { [] }

        it 'returns http success' do
          subject
          expect(response).to have_http_status(:success)
        end

        it 'updates the session end time' do
          expect { subject }.to(change { session.reload.session_end })
        end

        it 'does not create any events' do
          expect { subject }.to change(Course::Video::Session, :count).by(0)
        end
      end

      context 'when events are provided' do
        let(:events) do
          [{ sequence_num: 1,
             video_time_initial: 2345,
             event_type: 'play',
             event_time: Time.zone.now },
           { sequence_num: 10,
             video_time_initial: 1234,
             video_time_final: 10,
             event_type: 'seek',
             event_time: Time.zone.now }]
        end

        it 'returns http success' do
          subject
          expect(response).to have_http_status(:success)
        end

        it 'updates the session end time' do
          expect { subject }.to(change { session.reload.session_end })
        end

        it 'updates existing events' do
          event = session.events.find_by(sequence_num: 1)
          expect { subject }.to(change { event.reload.video_time_initial })
        end

        it 'only adds new events' do
          expect { subject }.to change(Course::Video::Event, :count).by(1)
        end
      end

      context 'when events are invalid' do
        let(:events) { [{ sequence_num: 10, video_time_initial: nil }] }
        it 'returns HTTP 400' do
          subject
          expect(response.status).to eq(400)
        end
      end
    end
  end
end
