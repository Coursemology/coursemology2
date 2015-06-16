require 'rails_helper'

RSpec.describe 'Test Duplicator Core Class' do
  class SimpleObject
    attr_reader :id

    def initialize(id)
      @id = id
    end

    # duplicate itself
    def duplicate(duplicator)
      self.clone
    end
  end

  context 'Without the Duplicator framework' do
    before :each do
      @obj_a = SimpleObject.new(1)
      @obj_b = @obj_a.duplicate(Duplicator.new)
    end

    it 'tests duplicated objects have the same attribute value' do
      expect(@obj_a.id).to eq(@obj_b.id)
    end

    it 'tests duplicated objects are not the same object' do
      expect(@obj_a).to_not be(@obj_b)
    end
  end

  context 'With the Duplicator framework' do
    before :each do
      @duplicator = Duplicator.new
      @obj_a = SimpleObject.new(2)
    end

    it 'tests objects not in list are not duplicated' do
      duplicated_object = @duplicator.duplicate_object(@obj_a)
      expect(duplicated_object).to be_nil
    end

    it 'tests object in list is duplicated' do
      @duplicator.duplicate([@obj_a])
      expect(@duplicator.duplicated_objects[@obj_a]).to_not be_nil
      expect(@duplicator.duplicated_objects[@obj_a]).to_not be(@obj_a)
      expect(@duplicator.duplicated_objects[@obj_a].id).to eq(2)
    end

  end
end
