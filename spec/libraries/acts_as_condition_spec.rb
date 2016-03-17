# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Condition', type: :model do
  describe 'objects which act as conditions' do
    subject do
      Class.new(ActiveRecord::Base) do
        def self.columns
          []
        end
        acts_as_condition
      end.new
    end

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
  end

  describe 'classes which implement acts_as_condition' do
    subject do
      Class.new(ActiveRecord::Base) do
        def self.columns
          []
        end
        acts_as_condition
      end
    end

    it 'implements .dependent_class' do
      expect(subject).to respond_to(:dependent_class)
      expect { subject.dependent_class }.to raise_error(NotImplementedError)
    end

    describe '.evaluate_conditional_for' do
      let(:instance) { create(:instance) }
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
