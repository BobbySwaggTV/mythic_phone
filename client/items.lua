-- RegisterNetEvent('mythic_phone:client:UseSDCard')
-- AddEventHandler('mythic_phone:client:UseSDCard', function(app)
--     exports['mythic_base']:FetchComponent('Progress'):Progress({
--         name = "install_app_action",
--         duration = 10000,
--         label = 'Installing ' .. app .. ' App',
--         useWhileDead = false,
--         canCancel = false,
--         controlDisables = {
--             disableMovement = true,
--             disableCarMovement = true,
--             disableMouse = true,
--             disableCombat = true,
--         },
--         animation = {
--             animDict = "cellphone@",
--             anim = "cellphone_text_in",
--             flags = 50,
--         },
--         prop = {
--             model = "prop_phone_ing_03",
--             bone = 28422,
--         },
--     }, function(status)
--         if not status then
--             TriggerServerEvent('mythic_phone:server:FinishInstallApp')
--         else
--             TriggerServerEvent('mythic_phone:server:CancelInstallApp')
--         end
--     end)
-- end)