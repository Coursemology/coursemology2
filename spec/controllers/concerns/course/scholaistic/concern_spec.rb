# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Scholaistic::Concern do
  controller(Course::Controller) do
    include Course::Scholaistic::Concern

    before_action :sync_all_scholaistic_submissions!

    def index; end
  end

  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_scholaistic_component_enabled) }

    before do
      controller.instance_variable_set(:@course, course)
      controller_sign_in(controller, create(:administrator))
    end

    subject { get :index, as: :json }

    describe '#sync_all_scholaistic_submissions!' do
      let(:upstream_id) { '76b0306a-ee60-45f7-814c-12ec7e590743' }
      let(:creator) { create(:course_user, course: course).user }

      context "when the assessments aren't synced" do
        before do
          allow(ScholaisticApiService).to receive(:all_submissions!).and_return([{
            upstream_id: upstream_id,
            upstream_assessment_id: '9f214d05-77bc-4756-a177-341ae2a982f5',
            status: :graded,
            grade: 0.85,
            creator_email: creator.email
          }])
        end

        context "when local doesn't exist" do
          it "doesn't change the records" do
            expect { subject }.
              to change { Course::ScholaisticSubmission.count }.by(0).
              and change { Course::ExperiencePointsRecord.count }.by(0)
          end
        end
      end

      context 'when the assessments are synced' do
        let(:scholaistic_assessment) { create(:scholaistic_assessment, course: course) }

        def create_submission_with_points_awarded(points_awarded)
          create(
            :scholaistic_submission,
            assessment: scholaistic_assessment,
            creator: creator,
            upstream_id: upstream_submission[:upstream_id],
            points_awarded: points_awarded
          )
        end

        def create_upstream_submission_with_status(status)
          {
            upstream_id: upstream_id,
            upstream_assessment_id: scholaistic_assessment.upstream_id,
            status: status,
            grade: 0.85,
            creator_email: creator.email
          }
        end

        context 'when upstream is graded' do
          let(:upstream_submission) { create_upstream_submission_with_status(:graded) }
          let(:points_awarded) { (scholaistic_assessment.base_exp * upstream_submission[:grade]).round }

          before { allow(ScholaisticApiService).to receive(:all_submissions!).and_return([upstream_submission]) }

          context 'when local exists' do
            context 'when exp is unchanged' do
              let(:submission) { create_submission_with_points_awarded(points_awarded) }

              it "doesn't change the submission" do
                expect { subject }.not_to(change { submission })
              end
            end

            context 'when exp is changed' do
              let(:submission) { create_submission_with_points_awarded(points_awarded - 100) }

              it 'updates the exp record' do
                expect { subject }.to change { submission.reload.points_awarded }.to(points_awarded)
              end
            end
          end

          context "when local doesn't exist" do
            it 'creates a new exp record' do
              expect { subject }.to change { scholaistic_assessment.submissions.count }.by(1)
              expect(scholaistic_assessment.submissions.last.points_awarded).to eq(points_awarded)
            end
          end
        end

        context 'when upstream is not graded' do
          let(:upstream_submission) { create_upstream_submission_with_status(:submitted) }

          before { allow(ScholaisticApiService).to receive(:all_submissions!).and_return([upstream_submission]) }

          context 'when local exists' do
            let!(:submission) { create_submission_with_points_awarded(2000) }
            let!(:other_submission) { create(:scholaistic_submission) }

            it 'deletes local' do
              expect { subject }.to change { scholaistic_assessment.submissions.count }.by(-1)
              expect { submission.reload }.to raise_error(ActiveRecord::RecordNotFound)
            end

            it 'deletes the exp record' do
              expect { subject }.to change { Course::ExperiencePointsRecord.count }.by(-1)
              expect { submission.experience_points_record.reload }.to raise_error(ActiveRecord::RecordNotFound)
            end

            it 'does not delete unrelated records' do
              expect { subject }.not_to(change { other_submission.reload })
            end
          end

          context "when local doesn't exist" do
            it "doesn't change the records" do
              expect { subject }.to change { scholaistic_assessment.submissions.count }.by(0).
                and change { Course::ExperiencePointsRecord.count }.by(0)
            end
          end
        end

        context "when upstream doesn't exist" do
          before { allow(ScholaisticApiService).to receive(:all_submissions!).and_return([]) }

          context 'when local exists' do
            let!(:submission) do
              create(
                :scholaistic_submission,
                assessment: scholaistic_assessment,
                points_awarded: 2000
              )
            end

            let!(:other_submission) { create(:scholaistic_submission) }

            it 'deletes local' do
              expect { subject }.to change { scholaistic_assessment.submissions.count }.by(-1)
              expect { submission.reload }.to raise_error(ActiveRecord::RecordNotFound)
            end

            it 'deletes the exp record' do
              expect { subject }.to change { Course::ExperiencePointsRecord.count }.by(-1)
              expect do
                submission.experience_points_record.reload
              end.to raise_error(ActiveRecord::RecordNotFound)
            end

            it 'does not delete unrelated records' do
              expect { subject }.not_to(change { other_submission.reload })
            end
          end

          context "when local doesn't exist" do
            it "doesn't change the records" do
              expect { subject }.to change { scholaistic_assessment.submissions.count }.by(0).
                and change { Course::ExperiencePointsRecord.count }.by(0)
            end
          end
        end
      end
    end
  end
end
