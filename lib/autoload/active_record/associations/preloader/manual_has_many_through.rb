class ActiveRecord::Associations::Preloader
  class ManualHasManyThrough < HasManyThrough
    def initialize(klass, owners, reflection, records)
      super(klass, owners, reflection, nil)

      @records_by_owner = records.each_with_object({}) do |record, h|
        owner_id = record[source_reflection.foreign_key]
        records = (h[owner_id] ||= [])
        records << record
      end
    end

    def associated_records_by_owner(preloader)
      preloader.preload(owners,
                        through_reflection.name,
                        through_scope)

      through_records = owners.map do |owner|
        association = owner.association through_reflection.name

        [owner, Array(association.reader)]
      end

      reset_association owners, through_reflection.name

      middle_records = through_records.flat_map { |(_, rec)| rec }

      preloaders = preloader.preload(middle_records,
                                     source_reflection.name,
                                     reflection_scope)

      @preloaded_records = preloaders.flat_map(&:preloaded_records)

      middle_to_pl = preloaders.each_with_object({}) do |pl, h|
        pl.owners.each do |middle|
          h[middle] = pl
        end
      end

      record_offset = {}
      @preloaded_records.each_with_index do |record, i|
        record_offset[record] = i
      end

      through_records.each_with_object({}) do |(lhs, center), records_by_owner|
        pl_to_middle = center.group_by { |record| middle_to_pl[record] }

        records_by_owner[lhs] = pl_to_middle.flat_map do |_pl, middles|
          rhs_records = middles.flat_map do |r|
            # For each source record, set the records which will be loaded
            @records_by_owner[r.id]
          end.compact

          rhs_records.sort_by { |rhs| record_offset[rhs] }
        end
      end
    end
  end
end
