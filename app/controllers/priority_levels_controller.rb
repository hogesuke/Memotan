# coding: utf-8

class PriorityLevelsController < ApplicationController
  
  def index
    @priority_level = PriorityLevel.all
  end
  
  def new
    @priority_level = PriorityLevel.new
  end
  
  def edit
    @priority_level = PriorityLevel.find(params[:id])
  end
  
  def create
    @priority_level = PriorityLevel.new(params[:priority_level])
    
    if @priority_level.save
      redirect_to(priority_levels_path, :notice => "新規作成に成功しました。")
    else
      render :action => "new"
    end
  end
  
  def update
    @priority_level = PriorityLevel.find(params[:id])
    
    if @priority_level.update_attributes(params[:priority_level])
      redirect_to(priority_levels_path, :notice => "更新に成功しました。")
    else
      render :action => "edit"
    end
  end
  
  def destroy
    @priority_level = PriorityLevel.find(params[:id])
    @priority_level.destroy
    
    redirect_to(priority_levels_path, :notice => "削除に成功しました。")
  end
  
  
end