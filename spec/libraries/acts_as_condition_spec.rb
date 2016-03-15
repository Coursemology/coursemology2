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

    it 'implements .resolve_conditional_for' do
      expect(subject).to respond_to(:resolve_conditional_for)

      user = double('user')
      expect(Course::Conditional::ConditionalResolvingService).to receive(:resolve).with(user).once
      subject.resolve_conditional_for(user)
    end
  end
end
