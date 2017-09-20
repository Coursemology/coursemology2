# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extensions: has_many inverse_through', type: :model do
  temporary_table(:stores) do
  end

  temporary_table(:products) do |t|
    t.references :store
    t.references :product, polymorphic: true
  end

  temporary_table(:pens) do
  end

  class self::Store < ApplicationRecord
    has_many :products, inverse_of: :store
    has_many :pens, through: :products, inverse_through: :product,
                    source: :product, source_type: 'Pen'
  end

  class self::Product < ApplicationRecord
    belongs_to :store, inverse_of: :products
    belongs_to :product, polymorphic: true
  end

  class self::Pen < ApplicationRecord
    has_one :product, inverse_of: :product, as: :product
    has_one :store, through: :product
  end

  with_temporary_table(:stores, :products, :pens) do
    context 'when constructing a new pen' do
      it 'recycles the join record' do
        store = self.class::Store.new
        store.pens.build(product: self.class::Product.new(store: store))

        store.save
        expect(store.products.length).to eq(1)
      end
    end
  end
end
