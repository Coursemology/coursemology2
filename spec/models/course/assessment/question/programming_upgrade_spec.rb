# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingUpgrade do
  it { is_expected.to belong_to(:question) }
  it { is_expected.to belong_to(:old_language) }
  it { is_expected.to belong_to(:new_language) }
  it { is_expected.to belong_to(:attachment).optional }
  it { is_expected.to belong_to(:job).optional }

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:question) { create(:course_assessment_question_programming, template_package: true) }
    let(:attachment) { question.attachment&.attachment }

    describe 'validations' do
      it 'allows only one row per question and package' do
        create(:course_assessment_question_programming_upgrade, question: question)
        duplicate = build(:course_assessment_question_programming_upgrade, question: question)

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:question_id]).not_to be_empty
      end

      it 'allows a second row for the same question under a different package' do
        create(:course_assessment_question_programming_upgrade, question: question)
        other = build(:course_assessment_question_programming_upgrade,
                      question: question, attachment: create(:attachment_reference).attachment)

        expect(other).to be_valid
      end
    end

    describe 'workflow' do
      subject { create(:course_assessment_question_programming_upgrade, question: question) }

      # Workflow events only write the attribute in this app (see DeferredWorkflowStatePersistence),
      # so a transition is not persisted until the record is saved. Assert on a reload throughout, or
      # these specs pass against in-memory state that never reaches the database.
      def transition!(event)
        subject.public_send(:"#{event}!")
        subject.save!
        subject.reload
      end

      it 'starts pending' do
        expect(subject.reload).to be_pending
      end

      it 'transitions pending -> running -> completed' do
        expect(transition!(:run)).to be_running
        expect(transition!(:complete)).to be_completed
      end

      # A question with no attachment never spawns an import job, so the upgrade is done as soon as
      # the language change commits.
      it 'allows pending to complete directly' do
        expect(transition!(:complete)).to be_completed
      end

      it 'allows a completed row to be restarted when the question is upgraded again' do
        transition!(:complete)
        expect(transition!(:start)).to be_pending
      end

      it 'allows a failed row to be restarted when the target is changed' do
        transition!(:fail)
        expect(transition!(:start)).to be_pending
      end

      it 'allows a failed row to be reverted, and returns to failed if the revert fails' do
        transition!(:fail)
        expect(transition!(:revert)).to be_reverting
        expect(transition!(:fail)).to be_failed
      end

      it 'does not allow a completed row to be reverted' do
        transition!(:complete)
        expect { subject.revert! }.to raise_error(Workflow::NoTransitionAllowed)
      end
    end

    describe '#in_flight? and #stale?' do
      it 'is in flight while pending' do
        upgrade = create(:course_assessment_question_programming_upgrade, question: question)
        expect(upgrade).to be_in_flight
        expect(upgrade).not_to be_stale
      end

      it 'is not in flight once completed' do
        upgrade = create(:course_assessment_question_programming_upgrade, :completed, question: question)
        expect(upgrade).not_to be_in_flight
      end

      # A lost import job would otherwise pin the question in a running state forever, blocking retry.
      it 'stops being in flight once it has gone stale' do
        upgrade = create(:course_assessment_question_programming_upgrade, :stale, question: question)
        expect(upgrade).to be_stale
        expect(upgrade).not_to be_in_flight
      end
    end

    describe 'authoritativeness' do
      it 'is authoritative while it matches the question package' do
        upgrade = create(:course_assessment_question_programming_upgrade, question: question)

        # Guard against this passing vacuously with NULLs on both sides.
        expect(attachment).to be_present
        expect(upgrade.attachment).to eq(attachment)

        expect(upgrade).to be_authoritative
        expect(described_class.authoritative).to include(upgrade)
        expect(question.reload.upgrade).to eq(upgrade)
      end

      it 'stops being authoritative once the package is replaced' do
        upgrade = create(:course_assessment_question_programming_upgrade, question: question)
        upgrade.update!(attachment: create(:attachment_reference).attachment)

        expect(upgrade.attachment).not_to eq(attachment)
        expect(upgrade).not_to be_authoritative
        expect(described_class.authoritative).not_to include(upgrade)
        expect(question.reload.upgrade).to be_nil
      end

      # Non-autograded and online-editor questions have no package at all. Both sides are NULL, which
      # only matches under IS NOT DISTINCT FROM.
      it 'is authoritative for an attachment-less question' do
        bare_question = create(:course_assessment_question_programming)
        expect(bare_question.attachment).to be_nil

        upgrade = create(:course_assessment_question_programming_upgrade,
                         question: bare_question, authoritative: false)

        expect(upgrade.attachment).to be_nil
        expect(upgrade).to be_authoritative
        expect(described_class.authoritative).to include(upgrade)
        expect(bare_question.reload.upgrade).to eq(upgrade)
      end
    end
  end
end
