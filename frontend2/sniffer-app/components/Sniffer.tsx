'use client'

import React, { FormEvent, useEffect, useState } from 'react'

type Packet = {
  src: string,
  dst: string,
  src_port: string,
  dst_port: string,
  protocol: string
}

function Sniffer() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [inf, setInf] = useState<string>("en0");
  const [filter, setFilter] = useState<string>('');
  const [interfaceList, setInterfaceList] = useState<string[]>([]);
  const wsRef = React.useRef<WebSocket | null>(null);

  const sniff = (e: FormEvent, intf: string) => {
    setPackets([]);
    e.preventDefault();
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/${intf}?filter=${filter}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const packetData: Packet = JSON.parse(event.data);
      setPackets(state => [...state, packetData]);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  const stopSniffing = () => {
    wsRef?.current?.close()
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);



  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const response = await fetch('http://localhost:8000/layers');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setInterfaceList(data);
      } catch (err) {
        console.log("Error fetching list of interfaces")
      }
    };

    fetchInterfaces();
  }, []);

  return (
    <div className='h-full'>
      <h1 className='font-bold text-3xl'>Sniffer</h1>
      <hr />
      <div className='flex flex-col justify-center space-y-2 mt-10'>
        <form
          className='w-full' 
          onSubmit={(e) => sniff(e, inf)}>
          <div className='flex justify-between'>
            <div className='flex space-x-2 items-center justify-center'>
              <label htmlFor="interface-select" className=''>Choose interface: </label>
              <select 
                id='interface-select'
                onChange={e => setInf(e.target.value)}
                value={inf}
                className='bg-slate-200 rounded p-2'
              >
                {
                  interfaceList.map((iface, k) => (
                    <option key={k} value={iface}>{iface}</option>
                  ))
                }
              </select>
              <select 
                id='filter-select'
                onChange={e => setFilter(e.target.value)}
                value={filter}
                className='bg-slate-200 rounded p-2'
              >
                <option value=''>All</option>
                <option value='tcp'>TCP</option>
                <option value='udp'>UDP</option>
              </select>
            </div>
            <div className='flex space-x-4'>
              <button type="submit"
                className="rounded bg-emerald-500 text-white font-bold px-2 py-1"
              >Start</button>
              <button
                type='button'
                onClick={stopSniffing}
                className="rounded bg-rose-500 text-white font-bold px-2 py-1"
              >
                Stop
              </button>
              <button
                type='button'
                onClick={() => setPackets([])}
                className="rounded bg-rose-500 text-white font-bold px-2 py-1"
              >
                Clear
              </button>
            </div>
            
          </div>
        </form>

        {/* Packet results */}
        <div className='w-full h-96 border overflow-y-auto'> {/* Set a fixed height */}
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-40'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
              <tr>
                <th scope="col" className="py-3 px-6">Source IP</th>
                <th scope="col" className="py-3 px-6">Dest IP</th>
                <th scope="col" className="py-3 px-6">Source Port</th>
                <th scope="col" className="py-3 px-6">Dest Port</th>
                <th scope="col" className="py-3 px-6">Protocol</th>
              </tr>
            </thead>
            <tbody>
              {
                packets.length === 0 ?
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-center">No packets</td>
                </tr>
                :
                packets.map((packet, k) => (
                  <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700' key={'row-'+k}>
                    {
                      Object.values(packet).map((packetUnit, i) => (
                        <td key={'packetData'+i} className='py-4 px-6'>
                          {packetUnit}
                        </td>
                      ))
                    }
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Sniffer;
