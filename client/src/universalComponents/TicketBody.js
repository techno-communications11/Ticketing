import React from 'react'
import { getDuration } from '../universalComponents/getDuration';
import { GrLinkNext } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import formatDate from '../universalComponents/FormatDate';
import '../styles/TicketTable.css'

function TicketBody({ ticket, index, currentPage, itemsPerPage, handleTicket }) {
    return (
        <tr key={ticket.ticketId}>
            <td className="text-center fw-medium">
                {(currentPage - 1) * itemsPerPage + index + 1}
            </td>
            <td className="text-center fw-medium text-shrink ">{ticket.ntid}</td>
            <td className="text-center fw-medium text-shrink ">{ticket.fullname}</td>
            <td className="text-center fw-medium text-shrink ">{ticket.status?.name}</td>
            <td className="text-center fw-medium text-shrink ">{formatDate(ticket.createdAt)}</td>
            <td className="text-center fw-medium text-shrink ">{ticket.completedAt ? formatDate(ticket.completedAt) : '-'}</td>
            <td className="text-center fw-medium text-shrink ">
                {ticket.completedAt ? getDuration(ticket.createdAt, ticket.completedAt) : '-'}
            </td>
            <td className="text-center fw-medium">
                <Link to="/details">
                    <GrLinkNext onClick={() => handleTicket(ticket.ticketId)} />
                </Link>
            </td>
        </tr>
    );
}

export default TicketBody;
