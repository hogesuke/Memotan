ToriatamaAlpha::Application.routes.draw do

  #resources :priority_levels
  #resources :learning_levels

  root :to => 'words#index'

 # resources :levelup_intervals do
 #   collection do
 #     get "select_max_level"
 #   end
 # end

  match 'login/', :to => 'login#index', :via => :get
  match 'login/logout', :to => 'login#logout', :via => :get
  match 'login/auth', :to => 'login#auth', :via => :post

  match 'words/', :to => 'words#index', :via => :get
  match 'words/new', :to => 'words#new', :via => :post
  match 'words/:id/edit', :to => 'words#edit', :via => :post
  match 'words/:id', :to => 'words#destroy', :via => :delete
  match 'words/', :to => 'words#create', :via => :post
  match 'words/:id', :to => 'words#update', :via => :put, :as => 'word'
  match 'words/list', :to => 'words#list', :via => :post
  match 'words/search', :to => 'words#search', :via => :post

  resources :users do
    member do
      get "complete"
    end
  end

 # resources :learning do
 #   collection do
 #     post "reflect_result"
 #     get "get_words"
 #     get "count_words_at_tag"
 #     get "count_all_test_words"
 #   end
 # end

  #OmniAuth
  match "/auth/:provider/callback" => "sessions#callback"
  match "/logout" => "sessions#destroy", :as => :logout

  #404
  match '*a', :to => 'errors#routing'

  # The priority is based upon order of creation:
  # first created -> highest priority.
  
  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action
  
  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)
  
  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products
  
  # Sample resource route with options:
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
  
  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end
  
  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end
  
  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
  
  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => "welcome#index"
  
  # See how all your routes lay out with "rake routes"
  
  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
