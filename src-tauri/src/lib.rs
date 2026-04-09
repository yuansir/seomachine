mod commands;
mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:seomachine.db", db::get_migrations())
                .build()
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::python::run_python_script,
            commands::python::check_python_env,
            commands::python::setup_python_env,
            commands::keys::store_api_key,
            commands::keys::get_api_key,
            commands::keys::delete_api_key,
            commands::keys::store_wordpress_config,
            commands::keys::get_wordpress_config,
            commands::keys::test_wordpress_connection,
            commands::wordpress::check_wordpress_status,
            commands::wordpress::publish_to_wordpress,
            commands::wordpress::get_wordpress_posts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
