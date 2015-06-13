Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
  concern :paginatable do
    get '(page/:page)', action: :index, on: :collection, as: ''
  end

  concern :conditional do
    namespace :condition do
      resources :achievements, except: [:index]
      resources :levels, except: [:index]
    end
  end

  devise_for :users, controllers: {
    registrations: 'user/registrations'
  }

  namespace :admin do
    get '/' => 'admin#index'
    resources :system_announcements, concerns: :paginatable
    resources :announcements, concerns: :paginatable
    resources :instances

    get 'components' => 'admin#components'
    patch 'components' => 'admin#update_components'
  end

  scope module: 'course' do
    resources :courses, except: [:edit] do
      resources :announcements, concerns: :paginatable
      resources :achievements do
        scope module: :achievement do
          concerns :conditional
        end
      end
      resources :levels, except: [:show, :edit, :update]

      get 'settings' => 'settings#index', as: :settings
      patch 'settings' => 'settings#update', as: :update_settings
      get 'components' => 'settings#components'
      patch 'components' => 'settings#update_components'

      resources :users, except: [:index, :new, :edit]
      post 'register' => 'users#register'
      get 'students' => 'users#students', as: :users_students
      get 'staff' => 'users#staff', as: :users_staff
      get 'requests' => 'users#requests', as: :users_requests

      resources :groups
    end
  end
end
