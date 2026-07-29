# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::ApplyVersionService, type: :service do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:source_course) { create(:course) }
    let(:source_assessment) do
      create(:assessment, :with_mcq_question, course: source_course, title: 'Marketplace Lab')
    end
    let(:destination_course) { create(:course) }
    let!(:listing) do
      Course::Assessment::Marketplace::PublishService.publish(source_assessment, user)
    end
    let(:copy) do
      create(:assessment, :with_mcq_question, course: destination_course, title: 'My Local Title')
    end
    let!(:adoption) do
      create(:course_assessment_marketplace_adoption,
             listing: listing, destination_course: destination_course,
             duplicated_assessment: copy,
             adopted_version_at: listing.current_version.published_at)
    end

    def cut_newer_version
      source_assessment.update!(title: 'Marketplace Lab v2')
      Course::Assessment::Marketplace::PublishService.publish_new_version(listing.reload, user)
    end

    describe '.apply' do
      it 'keeps the same assessment row rather than making a new one' do
        cut_newer_version

        expect { described_class.apply(copy, user) }.
          not_to(change { Course::Assessment.where(id: copy.id).count })

        expect(copy.reload).to be_present
      end

      it 'destroys the throwaway copy it duplicated to' do
        cut_newer_version

        expect { described_class.apply(copy, user) }.
          to change { destination_course.assessments.count }.by(0)
      end

      # Restamping the vintage is the ONLY thing that retires the update banner — there is no
      # dismissal state alongside it to clear.
      it 'advances the adoption to the served vintage' do
        version = cut_newer_version

        described_class.apply(copy, user)

        expect(adoption.reload.adopted_version_at).to be_within(1.second).of(version.published_at)
        expect(adoption.reload).not_to be_update_pending
      end

      it 'takes the title from the new version' do
        cut_newer_version

        described_class.apply(copy, user)

        expect(copy.reload.title).to eq('Marketplace Lab v2')
      end

      # Slice 3's rule, minus self-collision: the copy's own old title must not count against it.
      it 'renames when the new title is already taken in the destination course' do
        version = cut_newer_version
        create(:assessment, course: destination_course, title: 'Marketplace Lab v2')

        described_class.apply(copy, user)

        expect(copy.reload.title).to eq("Marketplace Lab v2 [#{version.published_at.strftime('%d %b %Y')}]")
      end

      it 'does not rename when only its own old title would collide' do
        cut_newer_version

        described_class.apply(copy, user)

        expect(copy.reload.title).to eq('Marketplace Lab v2')
      end

      it 'keeps the tab position the manager chose' do
        cut_newer_version
        original_tab_id = copy.tab_id

        described_class.apply(copy, user)

        expect(copy.reload.tab_id).to eq(original_tab_id)
      end

      # Replacing content must not silently expose or hide an assessment.
      it 'keeps the published state' do
        cut_newer_version
        copy.update!(published: true)

        described_class.apply(copy, user)

        expect(copy.reload.published).to be(true)
      end

      it 'replaces the questions with the new version questions' do
        old_question_ids = copy.questions.map(&:id)
        cut_newer_version

        described_class.apply(copy, user)

        expect(copy.reload.questions.map(&:id)).not_to match_array(old_question_ids)
        expect(copy.questions).not_to be_empty
        expect(Course::Assessment::Question.where(id: old_question_ids)).to be_empty
      end

      # Staff test runs do not block the update, but their answers point at questions that no longer
      # exist, so they go with them.
      it 'destroys the submissions that were on the copy' do
        manager = create(:course_manager, course: destination_course)
        create(:submission, :attempting, assessment: copy, creator: manager.user)
        cut_newer_version

        expect { described_class.apply(copy, user) }.
          to change { Course::Assessment::Submission.where(assessment_id: copy.id).count }.to(0)
      end

      it 'refuses once a real student has attempted by execution time' do
        create(:submission, :attempting, assessment: copy,
                                         creator: create(:course_student, course: destination_course).user)
        old_question_ids = copy.questions.map(&:id)
        cut_newer_version

        expect { described_class.apply(copy, user) }.
          to raise_error(ArgumentError, /students have already submitted/)

        expect(copy.reload.title).to eq('My Local Title')
        expect(copy.questions.map(&:id)).to match_array(old_question_ids)
        expect(adoption.reload.adopted_version_at).to be_within(1.second).of(listing.first_published_at)
      end

      # They were computed against a schedule that no longer exists. `find_or_create_personal_time_for`
      # rebuilds them on demand from the new reference times, so this is not data loss.
      it 'destroys personal times anchored to the replaced schedule' do
        student = create(:course_student, course: destination_course)
        copy.lesson_plan_item.find_or_create_personal_time_for(student).save!
        cut_newer_version

        expect { described_class.apply(copy, user) }.
          to change { Course::PersonalTime.where(lesson_plan_item_id: copy.lesson_plan_item.id).count }.to(0)
      end

      it 'refuses an assessment that was never adopted' do
        plain = create(:assessment, course: destination_course)

        expect { described_class.apply(plain, user) }.to raise_error(ArgumentError)
      end

      it 'refuses a listing with no current version' do
        listing.update!(current_version: nil)

        expect { described_class.apply(copy, user) }.to raise_error(ArgumentError)
      end

      # The whole point of one transaction: a half-replaced assessment has no questions and no way back.
      it 'leaves the copy untouched when the transplant fails' do
        cut_newer_version
        allow_any_instance_of(described_class).to receive(:copy_attributes!).and_raise('boom')

        expect { described_class.apply(copy, user) }.to raise_error('boom')
        expect(copy.reload.questions).not_to be_empty
        expect(copy.title).to eq('My Local Title')
      end
    end
  end
end
