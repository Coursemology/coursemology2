# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewCleanupJob, type: :job do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:container) { create(:course) }
    let(:previewer) { create(:course_manager, course: container) }
    let(:source_course) { create(:course) }

    def make_preview(submission_state: nil, last_activity: nil)
      copy = create(:assessment, :with_mcq_question, course: container)
      listing = create(:course_assessment_marketplace_listing,
                       assessment: create(:assessment, :with_mcq_question, course: source_course))
      marker = Course::Assessment::Marketplace::Preview.create!(
        listing: listing, course_user: previewer, assessment: copy
      )

      if submission_state
        submission = create(
          :submission, submission_state,
          assessment: copy, course_user: previewer, creator: previewer.user
        )
        submission.update_column(:updated_at, last_activity) if last_activity
      elsif last_activity
        marker.update_column(:updated_at, last_activity)
      end

      marker
    end

    describe '#perform' do
      it 'reaps a copy whose newest submission is older than the TTL' do
        marker = make_preview(submission_state: :attempting, last_activity: 3.days.ago)
        copy_id = marker.assessment_id

        expect { described_class.perform_now }.
          to change { Course::Assessment.where(id: copy_id).count }.from(1).to(0)

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).not_to exist
        expect(Course::Assessment::Submission.where(assessment_id: copy_id)).not_to exist
      end

      it 'keeps a copy whose attempting submission was touched within the TTL' do
        marker = make_preview(submission_state: :attempting, last_activity: 1.hour.ago)
        copy_id = marker.assessment_id

        expect { described_class.perform_now }.
          not_to(change { Course::Assessment.where(id: copy_id).count })

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).to exist
      end

      it 'keeps a just-finalised copy touched within the TTL (the grader-rehearsal guard)' do
        marker = make_preview(submission_state: :submitted, last_activity: 1.hour.ago)
        copy_id = marker.assessment_id

        expect { described_class.perform_now }.
          not_to(change { Course::Assessment.where(id: copy_id).count })

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).to exist
      end

      it 'keeps a copy when a newer submission sits alongside a stale one (newest wins)' do
        marker = make_preview(submission_state: :attempting, last_activity: 3.days.ago)
        copy_id = marker.assessment_id
        other = create(:course_student, course: container)
        create(:submission, :attempting, assessment: marker.assessment,
                                         course_user: other, creator: other.user).
          update_column(:updated_at, 1.hour.ago)

        expect { described_class.perform_now }.
          not_to(change { Course::Assessment.where(id: copy_id).count })

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).to exist
      end

      it 'reaps a submission-less copy whose marker is older than the TTL' do
        marker = make_preview(last_activity: 3.days.ago)
        copy_id = marker.assessment_id

        expect { described_class.perform_now }.
          to change { Course::Assessment.where(id: copy_id).count }.from(1).to(0)

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).not_to exist
      end

      it 'keeps a submission-less copy whose marker is within the TTL' do
        marker = make_preview(last_activity: 1.hour.ago)
        copy_id = marker.assessment_id

        expect { described_class.perform_now }.
          not_to(change { Course::Assessment.where(id: copy_id).count })

        expect(Course::Assessment::Marketplace::Preview.where(id: marker.id)).to exist
      end

      it 'leaves the container course, its tab and the previewer enrolment intact after a reap' do
        make_preview(last_activity: 3.days.ago)
        tab = container.assessment_categories.first.tabs.first

        described_class.perform_now

        expect(Course.where(id: container.id)).to exist
        expect(CourseUser.where(id: previewer.id)).to exist
        expect(Course::Assessment::Tab.where(id: tab.id)).to exist
      end

      it 'destroys at most BATCH_LIMIT copies per run' do
        stub_const("#{described_class}::BATCH_LIMIT", 1)
        first = make_preview(last_activity: 3.days.ago)
        second = make_preview(last_activity: 3.days.ago)

        expect { described_class.perform_now }.
          to change { Course::Assessment.where(id: [first.assessment_id, second.assessment_id]).count }.by(-1)
      end

      it 'logs and skips a copy that fails to destroy, still reaping the others' do
        bad = make_preview(last_activity: 3.days.ago)
        good = make_preview(last_activity: 3.days.ago)
        bad_copy_id = bad.assessment_id
        good_copy_id = good.assessment_id

        allow_any_instance_of(Course::Assessment).to receive(:destroy!).and_wrap_original do |method|
          raise 'boom' if method.receiver.id == bad_copy_id

          method.call
        end
        expect(Rails.logger).to receive(:warn).with(/skipped preview #{bad.id}/)

        described_class.perform_now

        expect(Course::Assessment.where(id: bad_copy_id)).to exist
        expect(Course::Assessment.where(id: good_copy_id)).not_to exist
      end

      it 'reaps regardless of the ambient tenant (it opens its own without_tenant scope)' do
        marker = make_preview(last_activity: 3.days.ago)
        copy_id = marker.assessment_id

        ActsAsTenant.without_tenant do
          expect { described_class.perform_now }.
            to change { Course::Assessment.where(id: copy_id).count }.from(1).to(0)
        end
      end
    end
  end
end
