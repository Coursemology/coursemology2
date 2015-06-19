require 'rails_helper'

RSpec.describe 'Test Duplicator Core Class' do
  class SimpleObject
    def initialize(id)
      @id = id
    end

    def duplicate(duplicator)
      self.clone
    end

    def ==(other)
      self.class == other.class && self.state == other.state
    end

    protected

    def state
      [@id]
    end
  end

  context 'Without the Duplicator framework' do
    before :each do
      @obj_a = SimpleObject.new(1)
      @obj_b = @obj_a.duplicate(Duplicator.new)
    end

    it 'tests duplicated objects have the same contents' do
      expect(@obj_a).to eq(@obj_b)
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

    it 'tests that objects in list are duplicated' do
      @duplicator.duplicate([@obj_a])
      duplicate_of_a = @duplicator.duplicate_of(@obj_a)

      expect(duplicate_of_a).to_not be_nil
      expect(duplicate_of_a).to_not be(@obj_a)
      expect(duplicate_of_a).to eq(@obj_a)
    end

    it 'ensures objects are only duplicated once' do
      @duplicator.duplicate([@obj_a])
      duplicate_of_a = @duplicator.duplicate_of(@obj_a)
      duplicate = @duplicator.duplicate_object(@obj_a)

      expect(duplicate).to_not be_nil
      expect(duplicate).to be(duplicate_of_a)
    end
  end
end
