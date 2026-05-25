!macro customHeader
  !ifdef BUILD_UNINSTALLER
    ; Skip during uninstaller build
  !else
    !define /redef MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
    !define /redef MUI_WELCOMEPAGE_TEXT "Your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines and calendar in one place.$\r$\nNo accounts. No tracking. No subscriptions.$\r$\n$\r$\nClick Next to continue."
    !define /redef MUI_FINISHPAGE_TITLE "HexBrief is ready"
    !define /redef MUI_FINISHPAGE_TEXT "Installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
    !define /redef MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
    !define /redef MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
  !endif
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\HexBrief"
!macroend
