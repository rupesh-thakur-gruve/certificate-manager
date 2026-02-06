{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.uvicorn
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.sqlite
    pkgs.libmagic
  ];
}
