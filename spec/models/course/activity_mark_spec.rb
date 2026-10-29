# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ActivityMark, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, course: course) }
    let(:created_at) { Time.utc(2026, 3, 31, 23, 30) }
    let(:mark) { { course_id: course.id, month: Date.new(2026, 3, 1), user_id: actor.id } }

    def create_activity(object)
      create(:activity, actor: actor, object: object, created_at: created_at)
    end

    describe '.record_for' do
      context 'when the actor is a student of the course' do
        let(:actor) { student }

        it 'records a mark for the UTC month, with the course instance' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(mark).pluck(:instance_id)).to eq([instance.id])
        end

        it 'records one mark for several activities in a month' do
          activity = create_activity(assessment)

          expect(Course::ActivityMark.record_for(activity)).to be(false)
          expect(Course::ActivityMark.where(course_id: course.id).count).to eq(1)
        end

        it 'attributes submissions and discussion posts to their course' do
          submission = create(:submission, assessment: assessment, course: course, creator: actor)
          topic = create(:forum_topic, course: course)
          post = create(:course_discussion_post, topic: topic.acting_as)

          [submission, post].each do |object|
            Course::ActivityMark.where(course_id: course.id).delete_all
            create_activity(object)

            expect(Course::ActivityMark.where(mark)).to exist
          end
        end

        it 'does not attribute activities on the course itself' do
          create_activity(course)

          expect(Course::ActivityMark.where(course_id: course.id)).not_to exist
        end

        it 'logs instead of raising when the mark cannot be recorded' do
          allow(Course::ActivityMark).to receive(:insert).and_raise(ActiveRecord::StatementInvalid)
          allow(Rails.logger).to receive(:error)

          expect { create_activity(assessment) }.not_to raise_error
          expect(Rails.logger).to have_received(:error).with(/Failed to record activity mark/)
        end
      end

      context 'when the actor is a phantom student' do
        let(:actor) { create(:course_student, :phantom, course: course).user }

        it 'does not record a mark' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(course_id: course.id)).not_to exist
        end
      end

      context 'when the actor is staff of the course' do
        let(:actor) { create(:course_manager, course: course).user }

        it 'does not record a mark' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(course_id: course.id)).not_to exist
        end
      end

      context 'when the actor is a system administrator' do
        let(:actor) { create(:course_student, course: course, user: create(:administrator)).user }

        it 'does not record a mark' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(course_id: course.id)).not_to exist
        end
      end

      context 'when the actor is an administrator of the course instance' do
        let(:actor) do
          create(:course_student, course: course, user: create(:instance_administrator, instance: instance).user).user
        end

        it 'does not record a mark' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(course_id: course.id)).not_to exist
        end
      end

      context 'when the actor is an administrator of another instance' do
        let(:actor) do
          other_instance = create(:instance)
          admin = ActsAsTenant.with_tenant(other_instance) { create(:instance_administrator).user }
          create(:course_student, course: course, user: admin).user
        end

        it 'records a mark' do
          create_activity(assessment)

          expect(Course::ActivityMark.where(mark)).to exist
        end
      end
    end
  end
end
