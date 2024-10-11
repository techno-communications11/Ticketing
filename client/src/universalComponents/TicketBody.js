import React from 'react'
import { getDuration } from '../universalComponents/getDuration';
import { GrLinkNext } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import formatDate from '../universalComponents/FormatDate';

function TicketBody({ticket,index,handleTicket}) {
    return (
        <tr key={ticket.ticketId}>
            <td className="text-center fw-medium">{index + 1}</td>
            <td className="text-center fw-medium">{ticket.ntid}</td>
            <td className="text-center fw-medium">{ticket.fullname}</td>
            <td className="text-center fw-medium">{ticket.status?.name}</td>
            <td className='text-center fw-medium'>{formatDate(ticket.createdAt)}</td>
            <td className='text-center fw-medium'>{ticket.completedAt ? formatDate(ticket.completedAt) : '-'}</td>
            <td className='text-center fw-medium'>
                {ticket.completedAt ? (
                    getDuration(ticket.createdAt, ticket.completedAt)
                ) : (
                    "-"
                )}
            </td>
            <td className="text-center fw-medium">
                <Link to="/details">
                    <GrLinkNext onClick={() => handleTicket(ticket.ticketId)} />
                </Link>
            </td>
        </tr>
    )
}

export default TicketBody
