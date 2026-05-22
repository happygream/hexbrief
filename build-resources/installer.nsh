; HexBrief Custom NSIS Installer Script
; Extends electron-builder's default NSIS with custom pages and branding

!macro customHeader
  ; Set modern UI
  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_BITMAP "${BUILD_RESOURCES_DIR}\header.bmp"
  !define MUI_WELCOMEFINISHPAGE_BITMAP "${BUILD_RESOURCES_DIR}\welcome.bmp"
  !define MUI_ICON "${BUILD_RESOURCES_DIR}\icon.ico"
  !define MUI_UNICON "${BUILD_RESOURCES_DIR}\icon.ico"

  ; Colours
  !define MUI_BGCOLOR "0A0F1E"
  !define MUI_TEXTCOLOR "F2F3F8"

  ; Custom strings
  !define MUI_WELCOMEPAGE_TITLE "Welcome to HexBrief"
  !define MUI_WELCOMEPAGE_TEXT "HexBrief is your personal morning dashboard.$\r$\n$\r$\nWeather, tasks, headlines, calendar and focus — all in one place. No accounts, no tracking.$\r$\n$\r$\nClick Next to continue."
  !define MUI_FINISHPAGE_TITLE "HexBrief is ready"
  !define MUI_FINISHPAGE_TEXT "HexBrief has been installed successfully.$\r$\n$\r$\nOpen it each morning for your daily brief."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\HexBrief.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch HexBrief now"
!macroend

!macro customInstall
  ; Write registry entries for Add/Remove Programs
  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"

  ; Create quick launch shortcut (optional)
  CreateShortCut "$QUICKLAUNCH\HexBrief.lnk" "$INSTDIR\HexBrief.exe" "" "$INSTDIR\HexBrief.exe" 0

  ; Set file association for .hexbrief config files
  WriteRegStr HKCR ".hexbrief" "" "HexBrief.Config"
  WriteRegStr HKCR "HexBrief.Config" "" "HexBrief Configuration"
  WriteRegStr HKCR "HexBrief.Config\DefaultIcon" "" "$INSTDIR\HexBrief.exe,0"
  WriteRegStr HKCR "HexBrief.Config\shell\open\command" "" '"$INSTDIR\HexBrief.exe" "%1"'
!macroend

!macro customUnInstall
  ; Clean registry on uninstall
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegKey HKCR ".hexbrief"
  DeleteRegKey HKCR "HexBrief.Config"

  ; Remove quick launch shortcut
  Delete "$QUICKLAUNCH\HexBrief.lnk"
!macroend

!macro customInstallMode
  ; Default to per-user install (no admin required)
  !define MULTIUSER_INSTALLMODE_DEFAULT_CURRENTUSER
!macroend
