# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Condition', type: :model do
  class self::DummyConditionClass < ApplicationRecord
    def self.columns
      []
    end

    def self.load_schema!; end

    acts_as_condition
  end

  describe 'objects which act as conditions' do
    subject { self.class::DummyConditionClass.new }

    it 'implements #title' do
      expect(subject).to respond_to(:title)
      expect { subject.title }.to raise_error(NotImplementedError)
    end

    it 'implements #satisfied_by?' do
      expect(subject).to respond_to(:satisfied_by?)
      expect { subject.satisfied_by?(double) }.to raise_error(NotImplementedError)
    end

    it 'implements #dependent_object' do
      expect(subject).to respond_to(:dependent_object)
      expect { subject.dependent_object }.to raise_error(NotImplementedError)
    end

    describe 'callbacks' do
      describe 'after condition is saved' do
        context 'when there are changes' do
          it 'rebuild satisfiability graph' do
            allow(subject).to receive(:saved_changes?).and_return(true)
            expect(subject).to receive(:rebuild_satisfiability_graph).once
            subject.run_callbacks(:save)
          end
        end

        context 'when there are no changes' do
          it 'does not rebuild satisfiability graph' do
            allow(subject).to receive(:changed?).and_return(false)
            expect(subject).to_not receive(:rebuild_satisfiability_graph)
            subject.run_callbacks(:save)
          end
        end
      end
    end
  end

  describe 'classes which implement acts_as_condition' do
    subject { self.class::DummyConditionClass }

    it 'implements .dependent_class' do
      expect(subject).to respond_to(:dependent_class)
      expect { subject.dependent_class }.to raise_error(NotImplementedError)
    end

    describe '.evaluate_conditional_for' do
      let(:instance) { Instance.default }
      with_tenant(:instance) do
        let(:course_user) { create(:course_user) }

        it 'returns an ActiveJob' do
          expect(subject.evaluate_conditional_for(course_user)).to be_a(ActiveJob::Base)
        end

        with_active_job_queue_adapter(:test) do
          it 'queues the job' do
            expect { subject.evaluate_conditional_for(course_user) }.
              to have_enqueued_job(Course::Conditional::ConditionalSatisfiabilityEvaluationJob)
          end
        end
      end
    end
  end
end
