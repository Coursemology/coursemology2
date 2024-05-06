# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTimesController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable, :with_multiple_reference_timelines_component_enabled) }
    let(:assigned_item) { create(:course_lesson_plan_item, course: course) }
    let(:unassigned_item) { create(:course_lesson_plan_item, course: course) }
    let!(:timeline) { create(:course_reference_timeline, course: course) }
    let!(:time) { create(:course_reference_time, reference_timeline: timeline, lesson_plan_item: assigned_item) }

    before { controller_sign_in(controller, user) }

    describe '#create' do
      # Convert Ruby Time to string because of differences in micro/nano-second precision between
      # database and in-memory time representations. See https://stackoverflow.com/a/20403290.
      let(:start_time) { 1.day.from_now.to_s }
      let(:bonus_end_time) { 2.days.from_now.to_s }
      let(:end_time) { 3.days.from_now.to_s }

      subject do
        post :create, as: :json, params: {
          course_id: course,
          reference_timeline_id: timeline,
          reference_time: {
            lesson_plan_item_id: unassigned_item.id,
            start_at: start_time,
            bonus_end_at: bonus_end_time,
            end_at: end_time
          }
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'creates the reference time' do
          expect { subject }.
            to change { timeline.reference_times.size }.by(1).
            and change { unassigned_item.reference_times.size }.by(1)

          is_expected.to have_http_status(:ok)

          new_time = assigns(:reference_time)
          expect(new_time.lesson_plan_item.id).to eq(unassigned_item.id)
          expect(new_time.start_at).to eq(start_time)
          expect(new_time.bonus_end_at).to eq(bonus_end_time)
          expect(new_time.end_at).to eq(end_time)
        end

        context 'when about to be assigned to an assigned lesson plan item in the same timeline' do
          subject do
            post :create, as: :json, params: {
              course_id: course,
              reference_timeline_id: timeline,
              reference_time: {
                lesson_plan_item_id: assigned_item.id,
                start_at: start_time,
                bonus_end_at: bonus_end_time,
                end_at: end_time
              }
            }
          end

          it 'fails and responds bad request with errors' do
            is_expected.to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end

        context 'when cannot be saved' do
          before do
            allow(time).to receive(:save).and_return(false)
            controller.instance_variable_set(:@reference_time, time)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let(:new_start_time) { 2.day.from_now.to_s }
      let(:new_bonus_end_time) { 3.days.from_now.to_s }
      let(:new_end_time) { 4.days.from_now.to_s }

      subject do
        patch :update, as: :json, params: {
          course_id: course,
          reference_timeline_id: timeline,
          id: time,
          reference_time: {
            start_at: new_start_time,
            bonus_end_at: new_bonus_end_time,
            end_at: new_end_time
          }
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'changes the assigned times' do
          is_expected.to have_http_status(:ok)

          updated_time = assigns(:reference_time)
          expect(updated_time.start_at).to eq(new_start_time)
          expect(updated_time.bonus_end_at).to eq(new_bonus_end_time)
          expect(updated_time.end_at).to eq(new_end_time)
        end

        context 'when about to have its lesson plan item changed' do
          subject do
            patch :update, as: :json, params: {
              course_id: course,
              reference_timeline_id: timeline,
              id: time,
              reference_time: { lesson_plan_item_id: unassigned_item.id }
            }
          end

          it 'does not change the assigned lesson plan item' do
            is_expected.to have_http_status(:ok)
            expect(time.lesson_plan_item.id).to eq(assigned_item.id)
          end
        end

        context 'when cannot be saved' do
          before do
            allow(time).to receive(:save).and_return(false)
            controller.instance_variable_set(:@reference_time, time)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      subject do
        delete :destroy, as: :json, params: {
          course_id: course,
          reference_timeline_id: timeline,
          id: time
        }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'destroys the time' do
          expect { subject }.
            to change { timeline.reference_times.size }.by(-1).
            and change { assigned_item.reference_times.size }.by(-1)

          is_expected.to have_http_status(:ok)
        end

        context 'when cannot be destroyed' do
          before do
            allow(time).to receive(:destroy).and_return(false)
            controller.instance_variable_set(:@reference_time, time)
          end

          it 'fails and responds bad request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(response.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Observer' do
        let(:user) { create(:course_observer, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
