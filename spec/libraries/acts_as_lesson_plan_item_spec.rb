# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Acts as Lesson Plan Item' do
  class self::DummyClass < ApplicationRecord
    def self.columns
      []
    end

    acts_as_lesson_plan_item
  end

  class self::DummyTodoClass < ApplicationRecord
    def self.columns
      []
    end

    acts_as_lesson_plan_item has_todo: true
  end

  subject(:dummy) { self.class::DummyClass.new }
  it { is_expected.to respond_to(:base_exp) }
  it { is_expected.to respond_to(:time_bonus_exp) }
  it { is_expected.to respond_to(:start_at) }
  it { is_expected.to respond_to(:end_at) }
  it { is_expected.to respond_to(:bonus_end_at) }
  it { is_expected.to respond_to(:acting_as) }
  it { expect(dummy.acting_as).to respond_to(:specific) }

  context 'when declared to have a todo' do
    subject { self.class::DummyTodoClass }

    it 'sets the class to have_todo' do
      expect(subject.has_todo?).to be_truthy
    end

    it 'sets all instances to respond with true to #can_start? by default' do
      expect(subject.new.can_user_start?).to be_truthy
    end
  end
end
