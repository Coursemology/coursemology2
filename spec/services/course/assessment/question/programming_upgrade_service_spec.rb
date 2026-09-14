# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingUpgradeService do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let(:assessment) { create(:assessment, course: course) }
    let(:py9) { Coursemology::Polyglot::Language::Python::Python3Point9.instance }
    let(:py10) { Coursemology::Polyglot::Language::Python::Python3Point10.instance }
    let(:py12) { Coursemology::Polyglot::Language::Python::Python3Point12.instance }
    let(:service) { described_class.new(course, user) }

    def programming_question(language: py9, package: true)
      create(:course_assessment_question_programming,
             assessment: assessment, language: language, template_package: package)
    end

    describe '#upgrade' do
      it 'flips the language, records the upgrade, and captures the import job' do
        question = programming_question
        upgrades, rejected = service.upgrade(question => py12)

        expect(rejected).to be_empty
        expect(question.reload.language).to eq(py12)

        upgrade = upgrades.first.reload
        expect(upgrade.old_language).to eq(py9)
        expect(upgrade.new_language).to eq(py12)
        expect(upgrade.attachment).to eq(question.attachment.attachment)
        expect(upgrade.creator).to eq(user)

        # The import job the question's own callback spawned, captured after commit.
        expect(upgrade.job_id).to eq(question.import_job_id)
        expect(upgrade.job_id).to be_present
        expect(upgrade).to be_running
      end

      # No package means process_package never reaches evaluate_package, so no import is enqueued and
      # there is nothing to wait for.
      it 'completes immediately for a question with no package' do
        question = programming_question(package: false)
        upgrades, = service.upgrade(question => py12)

        expect(question.reload.language).to eq(py12)
        expect(question.import_job_id).to be_nil
        expect(upgrades.first.reload).to be_completed
        expect(upgrades.first.job_id).to be_nil
      end

      it 'upgrades several questions in one call' do
        questions = Array.new(3) { programming_question }
        upgrades, rejected = service.upgrade(questions.to_h { |q| [q, py12] })

        expect(rejected).to be_empty
        expect(upgrades.size).to eq(3)
        expect(questions.each(&:reload).map(&:language)).to all(eq(py12))
      end

      describe 'rejections' do
        it 'rejects a question already on the target language' do
          question = programming_question(language: py12)
          upgrades, rejected = service.upgrade(question => py12)

          expect(upgrades).to be_empty
          expect(rejected[question.id]).to match(/already on that language/)
        end

        it 'rejects a deprecated target language without writing anything' do
          question = programming_question
          deprecated = py10
          Coursemology::Polyglot::Language.where(id: deprecated.id).update_all(enabled: false)

          upgrades, rejected = service.upgrade(question => deprecated.reload)

          expect(upgrades).to be_empty
          expect(rejected[question.id]).to match(/deprecated/)
          expect(question.reload.language).to eq(py9)
          expect(question.upgrade).to be_nil
        ensure
          Coursemology::Polyglot::Language.where(id: deprecated.id).update_all(enabled: true)
          # +.instance+ memoises one record per language class for the whole process, so the reload
          # above left every later example holding a deprecated Python 3.10.
          deprecated.reload
        end

        it 'rejects a question whose upgrade is still in flight' do
          question = programming_question
          service.upgrade(question => py12)

          upgrades, rejected = described_class.new(course, user).upgrade(question.reload => py10)

          expect(upgrades).to be_empty
          expect(rejected[question.id]).to match(/already running/)
        end

        it 'upgrades the valid questions and reports only the invalid ones' do
          good = programming_question
          already_there = programming_question(language: py12)

          upgrades, rejected = service.upgrade(good => py12, already_there => py12)

          expect(upgrades.size).to eq(1)
          expect(upgrades.first.question).to eq(good)
          expect(rejected.keys).to contain_exactly(already_there.id)
        end
      end

      describe 'the revert target' do
        # After a failed upgrade the question is already sitting on the broken language, so re-reading
        # it would point Revert at the version that just failed.
        it 'carries the old language forward when retargeting after a failure' do
          question = programming_question
          upgrades, = service.upgrade(question => py10)
          upgrade = upgrades.first.tap(&:reload)
          upgrade.fail!
          upgrade.save!

          service.upgrade(question.reload => py12)

          expect(upgrade.reload.old_language).to eq(py9)
          expect(upgrade.new_language).to eq(py12)
        end

        # A successful upgrade established a new baseline, so that becomes the revert target.
        it 'refreshes the old language when upgrading again after a success' do
          question = programming_question
          upgrades, = service.upgrade(question => py10)
          upgrade = upgrades.first.tap(&:reload)
          upgrade.complete!
          upgrade.save!

          service.upgrade(question.reload => py12)

          expect(upgrade.reload.old_language).to eq(py10)
          expect(upgrade.new_language).to eq(py12)
        end
      end
    end

    describe '#revert' do
      it 'moves the question back to the language it was last good on' do
        question = programming_question
        upgrades, = service.upgrade(question => py12)
        upgrade = upgrades.first.tap(&:reload)
        upgrade.fail!
        upgrade.save!

        upgrades, rejected = described_class.new(course, user).revert(upgrade)

        expect(rejected).to be_empty
        expect(question.reload.language).to eq(py9)
        expect(upgrades.first.reload).to be_reverting
        expect(upgrades.first.job_id).to eq(question.import_job_id)
      end

      # The pre-upgrade state has been restored, so there is nothing left to track and the question
      # falls back to its language-derived state.
      it 'destroys the row once the reverting import succeeds' do
        question = programming_question
        upgrades, = service.upgrade(question => py12)
        upgrade = upgrades.first.tap(&:reload)
        upgrade.fail!
        upgrade.save!

        reverted = described_class.new(course, user).revert(upgrade).first.first.reload
        reverted.job.update!(status: :completed)

        expect(reverted.refresh!).to be_nil
        expect { upgrade.reload }.to raise_error(ActiveRecord::RecordNotFound)
        expect(question.reload.language).to eq(py9)
      end
    end
  end
end
