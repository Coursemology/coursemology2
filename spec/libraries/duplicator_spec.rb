require 'rails_helper'

RSpec.describe 'Duplicator Core Class' do
  class SimpleObject
    attr_reader :id

    def initialize(id)
      @id = id
    end

    # duplicate itself
    def duplicate
      self.clone
    end
  end

  before :each do
    @obj_a = SimpleObject.new(1)
    @obj_b = @obj_a.duplicate
  end

  it 'tests duplicated objects have the same attribute value' do
    expect(@obj_a.id).to eq(@obj_b.id)
  end

  it 'tests duplicated objects are not the same object' do
    expect(@obj_a).to_not be(@obj_b)
  end
end
