import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private sessionId?: string; private experiment?: string;
  startSession(experimentCode: string){ this.sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2); this.experiment=experimentCode; this.log('session_start',{experimentCode}); }
  event(name:string,data?:any){ this.log(name,data); }
  endSession(){ if(this.sessionId) this.log('session_end',{}); this.sessionId=undefined; this.experiment=undefined; }
  private log(type:string,payload:any){ console.log('[telemetry]',{ts:new Date().toISOString(),session:this.sessionId,experiment:this.experiment,type,payload}); }
}
