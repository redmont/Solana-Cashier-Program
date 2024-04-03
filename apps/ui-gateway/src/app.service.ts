import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class AppService {
  private _bets: any[] = [];
  private _startTime: string = "";
  private _state: string = "";

  public get bets() {
    return this._bets;
  }

  public get startTime() {
    return this._startTime;
  }

  public get state() {
    return this._state;
  }

  constructor() {}

  public setBets(bets: any[]) {
    this._bets = bets;
  }

  public setMatchStatus(data: any) {
    console.log("Match status update", data);
    if (data.startTime) {
      this._startTime = data.startTime;
    }
    if (data.state) {
      this._state = data.state;
    }
  }
}
